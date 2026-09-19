from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

import pdfplumber
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MOCK_ROOT = Path(r"D:\Luminary Mocks")
DEFAULT_SAT_MATH = Path(r"C:\Users\Imron\Documents\SAT-Math-Mock-Pack\SAT-Math-Mocks-01-10-Expanded.json")
DEFAULT_SAT_RW = Path(r"C:\Users\Imron\Documents\SAT-English-Mock-Pack\SAT-Reading-Writing-Hard-Mocks-01-10.json")


def clean_text(value: Any) -> str:
    text = str(value or "")
    replacements = {
        "\ufeff": "",
        "\ufffd": "-",
        "\u2014": "-",
        "\u2013": "-",
        "\u2011": "-",
        "\u2212": "-",
        "\u2018": "'",
        "\u2019": "'",
        "\u201c": '"',
        "\u201d": '"',
        "\u00a0": " ",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"\*\*|__|`", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def compact(value: Any) -> str:
    return re.sub(r"\s+", " ", clean_text(value)).strip()


def json_load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def table_text(table: dict[str, Any] | None) -> str:
    if not table:
        return ""
    lines = []
    caption = compact(table.get("caption"))
    if caption:
        lines.append(caption)
    headers = [compact(item) for item in table.get("headers", [])]
    if headers:
        lines.append(" | ".join(headers))
    for row in table.get("rows", []):
        lines.append(" | ".join(compact(item) for item in row))
    return "\n".join(lines)


def sat_question(raw: dict[str, Any], prefix: str, section: str) -> dict[str, Any]:
    source_type = compact(raw.get("type")).lower()
    question_type = "numeric" if "student" in source_type else "single_choice"
    passage_parts = []
    if section == "rw":
        passage_parts.append(clean_text(raw.get("passage")))
    else:
        passage_parts.append(clean_text(raw.get("stimulus")))
    rendered_table = table_text(raw.get("table"))
    if rendered_table:
        passage_parts.append(rendered_table)
    result = {
        "id": compact(raw.get("id")) or prefix,
        "type": question_type,
        "prompt": compact(raw.get("prompt") or raw.get("question")),
        "passage": "\n\n".join(part for part in passage_parts if part),
        "domain": compact(raw.get("domain")),
        "skill": compact(raw.get("skill")),
        "difficulty": compact(raw.get("difficulty")).lower(),
        "explanation": compact(raw.get("explanation")),
    }
    if question_type == "numeric":
        answer = compact(raw.get("correctAnswer") if raw.get("correctAnswer") is not None else raw.get("correct"))
        result["acceptedAnswers"] = [answer]
    else:
        result["options"] = [compact(option) for option in raw.get("options", [])]
        result["correct"] = int(raw.get("correct", 0))
    return result


def build_sat_catalog(math_path: Path, rw_path: Path) -> list[dict[str, Any]]:
    math_tests = json_load(math_path)["tests"]
    rw_tests = json_load(rw_path)["tests"]
    if len(math_tests) != 10 or len(rw_tests) != 10:
        raise ValueError("Expected exactly 10 SAT Math and 10 SAT Reading and Writing tests")
    catalog = []
    for index, (rw_test, math_test) in enumerate(zip(rw_tests, math_tests), start=1):
        def modules(source: dict[str, Any], section: str, minutes: int) -> list[dict[str, Any]]:
            result = []
            for module_index, module in enumerate(source["modules"], start=1):
                result.append({
                    "id": f"sat-practice-{index:02d}-{section}-m{module_index}",
                    "title": f"Module {module_index}",
                    "stage": "linear",
                    "durationMinutes": minutes,
                    "questions": [
                        sat_question(question, f"sat{index:02d}-{section}-m{module_index}-q{question_index:02d}", section)
                        for question_index, question in enumerate(module["questions"], start=1)
                    ],
                })
            return result

        catalog.append({
            "schemaVersion": 1,
            "id": f"sat-practice-{index:02d}",
            "exam": "sat",
            "deliveryMode": "linear",
            "order": index,
            "title": f"Practice {index}",
            "description": "98 original questions across four timed Digital SAT modules.",
            "published": True,
            "sections": [
                {
                    "id": "rw",
                    "title": "Reading and Writing",
                    "breakMinutes": 10,
                    "modules": modules(rw_test, "rw", 32),
                },
                {
                    "id": "math",
                    "title": "Math",
                    "modules": modules(math_test, "math", 35),
                },
            ],
        })
    return catalog


def section_between(text: str, start: str, end: str | None) -> str:
    start_match = re.search(rf"(?im)^\s*(?:##\s*)?{start}\b[^\n]*", text)
    if not start_match:
        raise ValueError(f"Section {start} not found")
    body_start = start_match.end()
    if not end:
        return text[body_start:]
    end_match = re.search(rf"(?im)^\s*(?:##\s*)?{end}\b[^\n]*", text[body_start:])
    return text[body_start: body_start + end_match.start()] if end_match else text[body_start:]


def split_key_answer(raw: str) -> tuple[list[str], str]:
    value = compact(raw).strip("| ")
    value = re.split(r"\s+(?:-|:)\s+", value, maxsplit=1)[0].strip()
    value = re.sub(r"\s*\([^)]*paragraph[^)]*\)\s*$", "", value, flags=re.I)
    answers = [item.strip() for item in re.split(r"\s+/\s+", value) if item.strip()]
    expanded = []
    for answer in answers or [value]:
        match = re.fullmatch(r"(.+?)\(s\)", answer, re.I)
        if match:
            expanded.extend([match.group(1), f"{match.group(1)}s"])
        else:
            expanded.append(answer)
    return list(dict.fromkeys(filter(None, expanded))), value


def markdown_answer_key(section: str) -> dict[int, dict[str, Any]]:
    key_match = re.search(r"(?im)^\s*(?:#{3,4}\s*)?(?:LISTENING|READING)?\s*ANSWER KEY\s*$", section)
    if not key_match:
        raise ValueError("Answer key not found")
    key_text = section[key_match.end():]
    result: dict[int, dict[str, Any]] = {}
    for line in key_text.splitlines():
        stripped = line.strip()
        if not stripped or re.fullmatch(r"\|?[-:| ]+\|?", stripped):
            continue
        if stripped.startswith("|"):
            cells = [compact(cell) for cell in stripped.strip("|").split("|")]
            if cells and cells[0].isdigit() and len(cells) >= 2:
                number = int(cells[0])
                answers, _ = split_key_answer(cells[1])
                result[number] = {
                    "answers": answers,
                    "kind": cells[2] if len(cells) > 2 else "",
                    "difficulty": cells[3].lower() if len(cells) > 3 else "",
                    "explanation": cells[4] if len(cells) > 4 else "",
                }
            continue
        match = re.match(r"^(\d{1,2})[.)]\s*(.+)$", stripped)
        if not match:
            continue
        number = int(match.group(1))
        remainder = match.group(2)
        answer_part, _, detail = remainder.partition(" - ")
        if " — " in remainder:
            answer_part, detail = remainder.split(" — ", 1)
        answer_bits = [piece.strip() for piece in answer_part.split(",")]
        answers, _ = split_key_answer(answer_bits[0])
        result[number] = {
            "answers": answers,
            "kind": answer_bits[1] if len(answer_bits) > 1 else "",
            "difficulty": answer_bits[2].lower() if len(answer_bits) > 2 else "",
            "explanation": detail.strip(),
        }
    if set(result) != set(range(1, 41)):
        missing = sorted(set(range(1, 41)) - set(result))
        raise ValueError(f"Answer key is incomplete; missing {missing}")
    return result


def pdf_answer_keys(path: Path) -> tuple[dict[int, dict[str, Any]], dict[int, dict[str, Any]]]:
    listening: dict[int, dict[str, Any]] = {}
    reading: dict[int, dict[str, Any]] = {}
    mode = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            page_text = clean_text(page.extract_text() or "").upper()
            stop_after_page = False
            if "LISTENING ANSWER KEY" in page_text:
                mode = "listening"
            elif "READING ANSWER KEY" in page_text:
                mode = "reading"
            elif re.search(r"^WRITING\b", page_text, re.M):
                stop_after_page = True
            if not mode:
                continue
            target = listening if mode == "listening" else reading
            for table in page.extract_tables() or []:
                for row in table:
                    cells = [compact(cell) for cell in (row or [])]
                    number_index = next((i for i, cell in enumerate(cells) if cell.isdigit() and 1 <= int(cell) <= 40), None)
                    if number_index is None:
                        continue
                    answer_index = next((i for i in range(number_index + 1, len(cells)) if cells[i]), None)
                    if answer_index is None:
                        continue
                    number = int(cells[number_index])
                    answers, _ = split_key_answer(cells[answer_index])
                    kind = cells[answer_index + 1] if answer_index + 1 < len(cells) else ""
                    difficulty = cells[answer_index + 2].lower() if answer_index + 2 < len(cells) else ""
                    explanation = cells[answer_index + 3] if answer_index + 3 < len(cells) else ""
                    target[number] = {"answers": answers, "kind": kind, "difficulty": difficulty, "explanation": explanation}
            if stop_after_page:
                mode = ""
    for label, key in (("Listening", listening), ("Reading", reading)):
        if set(key) != set(range(1, 41)):
            missing = sorted(set(range(1, 41)) - set(key))
            raise ValueError(f"{label} PDF answer key is incomplete; missing {missing}")
    return listening, reading


def strip_answer_key(section: str) -> str:
    return re.split(r"(?im)^\s*(?:#{3,4}\s*)?(?:LISTENING|READING)?\s*ANSWER KEY\s*$", section, maxsplit=1)[0]


def find_question_position(text: str, number: int, start: int = 0) -> int | None:
    matches = []
    direct = re.search(rf"(?m)^\s*(?:\*\*)?{number}[.)](?:\*\*)?\s+", text[start:])
    if direct:
        matches.append(start + direct.start())
    parenthesized = re.search(rf"\(\s*{number}\s*\)\s*_+", text[start:])
    if parenthesized:
        absolute = start + parenthesized.start()
        line_start = text.rfind("\n", 0, absolute) + 1
        line_end = text.find("\n", absolute)
        if line_end < 0:
            line_end = len(text)
        line = text[line_start:line_end]
        matches.append(line_start if len(re.findall(r"\(\s*\d+\s*\)", line)) == 1 else absolute)
    embedded = re.search(rf"(?:\*\*)?{number}[.)](?:\*\*)?\s*_+", text[start:])
    if embedded:
        matches.append(start + embedded.start())
    return min(matches) if matches else None


def question_segments(text: str, numbers: range) -> dict[int, str]:
    positions: dict[int, int] = {}
    cursor = 0
    for number in numbers:
        position = find_question_position(text, number, cursor)
        if position is None:
            position = find_question_position(text, number, 0)
        if position is not None:
            positions[number] = position
            cursor = position + 1
    ordered = sorted(positions.items(), key=lambda item: item[1])
    result = {}
    for index, (number, position) in enumerate(ordered):
        end = ordered[index + 1][1] if index + 1 < len(ordered) else len(text)
        result[number] = text[position:end]
    return result


def parse_options(segment: str) -> list[str]:
    plain = clean_text(segment)
    option_matches = list(re.finditer(r"(?m)(?:^|\n)\s*([A-D])[.)]\s+", plain))
    if len(option_matches) < 2:
        option_matches = list(re.finditer(r"(?:^|\s)([A-D])[.)]\s+", compact(plain)))
        plain = compact(plain)
    options = []
    for index, match in enumerate(option_matches):
        end = option_matches[index + 1].start() if index + 1 < len(option_matches) else len(plain)
        options.append(compact(plain[match.end():end]))
    return options[:4]


def prompt_from_segment(segment: str, number: int) -> str:
    text = clean_text(segment)
    began_with_marker = bool(re.match(rf"^\s*\(\s*{number}\s*\)", text))
    text = re.sub(rf"^\s*(?:\*\*)?{number}[.)](?:\*\*)?\s*", "", text)
    text = re.sub(rf"\(\s*{number}\s*\)\s*_*", "", text)
    text = re.sub(rf"(?:\*\*)?{number}[.)](?:\*\*)?\s*_+", "", text)
    next_group = re.search(r"(?im)^\s*(?:#{3,4}\s*)?(?:\*\*)?Questions?\s+\d+\s*[-–]\s*\d+", text)
    if next_group:
        text = text[:next_group.start()]
    option_match = re.search(r"(?m)(?:^|\n)\s*[A-D][.)]\s+", text)
    if option_match:
        text = text[:option_match.start()]
    text = re.sub(r"_+", "", text)
    text = re.sub(r"^\s*[-|]+\s*$", "", text, flags=re.M)
    result = compact(text).strip("|- ")
    return f"Question {number}" if began_with_marker else (result[:1600] or f"Question {number}")


def question_from_source(number: int, segment: str, key: dict[str, Any], prefix: str) -> dict[str, Any]:
    answers = key["answers"]
    answer = answers[0] if answers else ""
    options = parse_options(segment)
    question: dict[str, Any] = {
        "id": f"{prefix}-q{number:02d}",
        "prompt": prompt_from_segment(segment, number),
        "difficulty": key.get("difficulty", ""),
        "explanation": compact(key.get("explanation", "")),
    }
    if options and re.fullmatch(r"[A-D]", answer, re.I):
        question.update({"type": "single_choice", "options": options, "correct": ord(answer.upper()) - 65})
    else:
        cleaned_answers = []
        for item in answers:
            short = re.sub(r"\s*\([^)]*\)\s*$", "", item).strip()
            cleaned_answers.extend([item, short] if short and short != item else [item])
        question.update({"type": "text", "acceptedAnswers": list(dict.fromkeys(filter(None, cleaned_answers))) or [answer]})
    return question


def blocks_by_heading(section: str, label: str, count: int) -> list[str]:
    heading = rf"(?im)^\s*(?:###\s*)?{label}\s+(\d+)\b[^\n]*"
    matches = list(re.finditer(heading, section))
    if len(matches) < count:
        raise ValueError(f"Expected {count} {label} blocks, found {len(matches)}")
    blocks = []
    for index, match in enumerate(matches[:count]):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(section)
        blocks.append(section[match.end():end])
    return blocks


def listening_parts(section: str, key: dict[int, dict[str, Any]], prefix: str) -> list[dict[str, Any]]:
    section = strip_answer_key(section)
    blocks = blocks_by_heading(section, "Part", 4)
    parts = []
    for part_index, block in enumerate(blocks, start=1):
        start = (part_index - 1) * 10 + 1
        numbers = range(start, start + 10)
        split = re.search(r"(?im)^\s*(?:#{4}\s*)?(?:\*\*)?Audio Script(?:\*\*)?\s*$", block)
        question_text = block
        transcript = ""
        if split:
            before, after = block[:split.start()], block[split.end():]
            if re.search(rf"(?m)^\s*(?:\*\*)?{start}[.)]", before) or re.search(rf"\(\s*{start}\s*\)", before):
                question_text, transcript = before, after
            else:
                question_heading = re.search(r"(?im)^\s*(?:#{4}\s*)?(?:\*\*)?Questions?\s+\d+", after)
                if question_heading:
                    transcript, question_text = after[:question_heading.start()], after[question_heading.start():]
                else:
                    transcript, question_text = after, before
        segments = question_segments(question_text, numbers)
        questions = [question_from_source(number, segments.get(number, ""), key[number], f"{prefix}-l") for number in numbers]
        reference = clean_text(question_text)
        parts.append({
            "id": f"{prefix}-listening-part-{part_index}",
            "title": f"Part {part_index}",
            "instructions": "Listening audio will be added by the administrator.",
            "passage": reference,
            "audioUrl": "",
            "transcript": clean_text(transcript),
            "questions": questions,
        })
    return parts


def reading_parts(section: str, key: dict[int, dict[str, Any]], prefix: str) -> list[dict[str, Any]]:
    section = strip_answer_key(section)
    blocks = blocks_by_heading(section, "Passage", 3)
    ranges = [range(1, 14), range(14, 27), range(27, 41)]
    parts = []
    for part_index, (block, numbers) in enumerate(zip(blocks, ranges), start=1):
        question_heading = re.search(r"(?im)^\s*(?:#{4}\s*)?(?:\*\*)?Questions?\s+\d+", block)
        if question_heading:
            passage, question_text = block[:question_heading.start()], block[question_heading.start():]
        else:
            first = find_question_position(block, numbers.start, 0)
            passage, question_text = (block[:first], block[first:]) if first is not None else (block, "")
        segments = question_segments(question_text, numbers)
        questions = [question_from_source(number, segments.get(number, ""), key[number], f"{prefix}-r") for number in numbers]
        parts.append({
            "id": f"{prefix}-reading-passage-{part_index}",
            "title": f"Passage {part_index}",
            "passage": clean_text(passage),
            "questions": questions,
        })
    return parts


def writing_questions(section: str, prefix: str) -> list[dict[str, Any]]:
    task_matches = list(re.finditer(r"(?im)^\s*(?:###\s*)?Task\s+([12])\b[^\n]*", section))
    if len(task_matches) < 2:
        raise ValueError("Expected two Writing tasks")
    tasks = []
    for index, match in enumerate(task_matches[:2]):
        end = task_matches[index + 1].start() if index + 1 < len(task_matches) else len(section)
        body = clean_text(section[match.end():end])
        task_number = index + 1
        tasks.append({
            "id": f"{prefix}-writing-task-{task_number}",
            "type": "writing",
            "prompt": body,
            "passage": body if task_number == 1 else "",
            "minWords": 150 if task_number == 1 else 250,
            "recommendedMinutes": 20 if task_number == 1 else 40,
        })
    return tasks


def markdown_mock(path: Path, practice_number: int) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    listening = section_between(text, "LISTENING", "READING")
    reading = section_between(text, "READING", "WRITING")
    writing = section_between(text, "WRITING", "SPEAKING")
    prefix = f"ielts-practice-{practice_number:02d}"
    return ielts_mock(
        practice_number,
        listening_parts(listening, markdown_answer_key(listening), prefix),
        reading_parts(reading, markdown_answer_key(reading), prefix),
        writing_questions(writing, prefix),
    )


def pdf_mock(path: Path, practice_number: int) -> dict[str, Any]:
    reader = PdfReader(str(path))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    listening = section_between(text, "LISTENING", "READING")
    reading = section_between(text, "READING", "WRITING")
    writing = section_between(text, "WRITING", "SPEAKING")
    listening_key, reading_key = pdf_answer_keys(path)
    prefix = f"ielts-practice-{practice_number:02d}"
    return ielts_mock(
        practice_number,
        listening_parts(listening, listening_key, prefix),
        reading_parts(reading, reading_key, prefix),
        writing_questions(writing, prefix),
    )


def ielts_mock(practice_number: int, listening: list[dict[str, Any]], reading: list[dict[str, Any]], writing: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "id": f"ielts-practice-{practice_number:02d}",
        "exam": "ielts-academic",
        "order": practice_number,
        "title": f"Practice {practice_number}",
        "description": "IELTS Academic Listening, Reading and Writing practice. Listening audio will be added later.",
        "published": True,
        "sections": [
            {
                "id": "listening",
                "title": "Listening",
                "modules": [{"id": f"ielts-practice-{practice_number:02d}-listening", "title": "Listening", "durationMinutes": 40, "parts": listening}],
            },
            {
                "id": "reading",
                "title": "Academic Reading",
                "modules": [{"id": f"ielts-practice-{practice_number:02d}-reading", "title": "Reading", "durationMinutes": 60, "parts": reading}],
            },
            {
                "id": "writing",
                "title": "Academic Writing",
                "modules": [{"id": f"ielts-practice-{practice_number:02d}-writing", "title": "Writing", "durationMinutes": 60, "questions": writing}],
            },
        ],
    }


def build_ielts_catalog(mock_root: Path) -> list[dict[str, Any]]:
    first_pack = [ROOT / f"mock-{number:02d}.md" for number in range(1, 6)]
    second_pack: list[Path] = [mock_root / "IELTS" / "mock test 01.pdf"] + [mock_root / "IELTS" / f"mock_test_{number:02d}.md" for number in range(2, 6)]
    sources = first_pack + second_pack
    missing = [str(path) for path in sources if not path.exists()]
    if missing:
        raise FileNotFoundError("Missing IELTS sources:\n" + "\n".join(missing))
    catalog = []
    for number, source in enumerate(sources, start=1):
        print(f"Parsing IELTS Practice {number}: {source}")
        catalog.append(pdf_mock(source, number) if source.suffix.lower() == ".pdf" else markdown_mock(source, number))
    return catalog


def audit(catalog: list[dict[str, Any]], exam: str) -> None:
    expected = 10
    if len(catalog) != expected:
        raise ValueError(f"Expected {expected} {exam} practices, found {len(catalog)}")
    for mock in catalog:
        sections = {section["id"]: section for section in mock["sections"]}
        if exam == "sat":
            rw = sum(len(module["questions"]) for module in sections["rw"]["modules"])
            math = sum(len(module["questions"]) for module in sections["math"]["modules"])
            if (rw, math) != (54, 44):
                raise ValueError(f"{mock['id']}: expected SAT counts 54/44, found {rw}/{math}")
        else:
            listening = sum(len(part["questions"]) for module in sections["listening"]["modules"] for part in module["parts"])
            reading = sum(len(part["questions"]) for module in sections["reading"]["modules"] for part in module["parts"])
            writing = sum(len(module["questions"]) for module in sections["writing"]["modules"])
            if (listening, reading, writing) != (40, 40, 2):
                raise ValueError(f"{mock['id']}: expected IELTS counts 40/40/2, found {listening}/{reading}/{writing}")


def write_catalog(path: Path, catalog: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {path} ({path.stat().st_size:,} bytes)")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build Luminary's bundled SAT and IELTS mock catalogs")
    parser.add_argument("--mock-root", type=Path, default=DEFAULT_MOCK_ROOT)
    parser.add_argument("--sat-math", type=Path, default=DEFAULT_SAT_MATH)
    parser.add_argument("--sat-rw", type=Path, default=DEFAULT_SAT_RW)
    args = parser.parse_args()

    sat = build_sat_catalog(args.sat_math, args.sat_rw)
    ielts = build_ielts_catalog(args.mock_root)
    audit(sat, "sat")
    audit(ielts, "ielts")
    write_catalog(ROOT / "data" / "full-mocks" / "sat.json", sat)
    write_catalog(ROOT / "data" / "full-mocks" / "ielts-academic.json", ielts)


if __name__ == "__main__":
    main()

import json
import re
import sys
from pathlib import Path

import pdfplumber


CATEGORIES = (
    "Information and Ideas",
    "Craft and Structure",
    "Expression of Ideas",
    "Standard English Conventions",
    "Algebra",
    "Advanced Math",
    "Problem-Solving and Data Analysis",
    "Geometry and Trigonometry",
)


def clean(text: str) -> str:
    text = text.replace("\u00ad", "")
    text = re.sub(r"([\-–—])\s*\n\s*(?=\w)", r"\1", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", " ", text)
    return text.strip()


def category_from_header(header: str) -> str:
    normalized = clean(header).lower()
    for category in CATEGORIES:
        if category.lower() in normalized:
            return category
    if "standard english" in normalized and "conventions" in normalized:
        return "Standard English Conventions"
    raise ValueError(f"Unrecognized category header: {clean(header)}")


def parse_answers(block: str, page_number: int) -> list[str]:
    matches = list(re.finditer(r"(?m)^([A-D])\.\s+", block))
    if [match.group(1) for match in matches] != list("ABCD"):
        raise ValueError(f"Page {page_number}: could not find answers A-D")
    answers = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(block)
        answers.append(clean(block[match.end():end]))
    return answers


def parse_page(text: str, page_number: int) -> dict:
    question_id = re.search(r"Question ID:\s*([^\s]+)", text)
    question_marker = re.search(r"(?m)^Question\s*$", text)
    answer_marker = re.search(r"(?m)^Answer\s*$", text)
    correct_marker = re.search(r"(?m)^Correct Answer:\s*([A-D])\s*$", text)
    rationale_marker = re.search(r"(?m)^Rationale\s*$", text)
    if not all((question_id, question_marker, answer_marker, correct_marker, rationale_marker)):
        raise ValueError(f"Page {page_number}: required markers are missing")

    header = text[question_id.end():question_marker.start()]
    section = "math" if re.search(r"SAT\s+Math", header, re.I) else "rw"
    question = clean(text[question_marker.end():answer_marker.start()])
    answers = parse_answers(text[answer_marker.end():correct_marker.start()], page_number)
    explanation = clean(text[rationale_marker.end():])
    correct = ord(correct_marker.group(1)) - ord("A")

    return {
        "exam": "sat",
        "section": section,
        "theme": category_from_header(header),
        "question": question,
        "answers": answers,
        "correct": correct,
        "explanation": explanation,
        "sourceId": question_id.group(1),
    }


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Usage: extract_questionbank_pdf.py INPUT.pdf OUTPUT.json")
    source, output = map(Path, sys.argv[1:])
    records = []
    with pdfplumber.open(source) as pdf:
        for index, page in enumerate(pdf.pages, start=1):
            records.append(parse_page(page.extract_text() or "", index))

    if not records:
        raise ValueError("No questions were extracted")
    for index, record in enumerate(records, start=1):
        if len(record["answers"]) != 4 or record["correct"] not in range(4):
            raise ValueError(f"Question {index} failed schema validation")

    output.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(records)} questions to {output}")


if __name__ == "__main__":
    main()

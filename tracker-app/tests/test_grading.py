from tracker import grading, zipgrade


def test_normalize_choice():
    assert grading.normalize_choice("b") == "2"
    assert grading.normalize_choice(" D ") == "4"
    assert grading.normalize_choice("3") == "3"
    assert grading.normalize_choice("3.0") == "3"
    assert grading.normalize_choice("") == ""
    assert grading.normalize_choice("AB") == "AB"   # double bubble never matches


def test_score():
    assert grading.score("MC", "2", "2", 1) == 1
    assert grading.score("MC", "3", "2", 1) == 0
    assert grading.score("MC", "", "2", 1) == 0      # present but left blank
    assert grading.score("MC", "2", "", 1) is None   # no key yet
    assert grading.score("CR", "2", "", 2) == 2
    assert grading.score("CR", "5", "", 2) == 2      # clamped
    assert grading.score("CR", "", "", 2) is None


def test_zipgrade_guessing():
    h = ["Quiz Name", "First Name", "ZipGradeID", "External Id", "Num Correct", "Stu1", "PriKey1", "Points1", "Stu2"]
    assert zipgrade.guess_id_column(h) == 2
    assert zipgrade.guess_question_column(h, 1) == 5
    assert zipgrade.guess_question_column(h, 2) == 8
    assert zipgrade.guess_question_column(["Student ID", "Q1", "Q2"], 2) == 2
    assert zipgrade.guess_id_column(["Name", "External Id"]) == 1


def test_parse_csv_bom_and_semicolon():
    headers, rows = zipgrade.parse_csv("﻿ZipGradeID;Stu1\n1001;B\n\n1002;C\n".encode("utf-8"))
    assert headers == ["ZipGradeID", "Stu1"]
    assert rows == [["1001", "B"], ["1002", "C"]]


def test_clean_id():
    assert zipgrade.clean_id("1004.0") == "1004"
    assert zipgrade.clean_id(" 0123 ") == "0123"

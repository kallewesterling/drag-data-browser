from pathlib import Path
import json
import os
import shutil


# TODO: Move these out of the way
ROOT = "/Users/kallewesterling/Repositories/kallewesterling/dissertation/drag-data-browser/"
OUTPUT_DIR = ROOT + "docs/"
DATASET_OUTPUT_DIR = OUTPUT_DIR + "dataset/"
DATA_OUTPUT_DIR = OUTPUT_DIR + "data/"


def keyshift(dictionary, key, diff):
    """see https://stackoverflow.com/questions/28035490/in-python-how-can-i-get-the-next-and-previous-keyvalue-of-a-particular-key-in"""
    if key in dictionary:
        token = object()
        keys = [token] * (diff * -1) + sorted(dictionary) + [token] * diff
        newkey = keys[keys.index(key) + diff]
        if newkey is token:
            return None
        else:
            return newkey
    else:
        return None


def verify_parent(self):
    if not self.parent.exists():
        self.parent.mkdir(parents=True)


Path.verify_parent = verify_parent


def write_json(self, obj):
    return self.write_text(json.dumps(obj))


Path.write_json = write_json


def read_json(self):
    return json.loads(self.read_text())


Path.read_json = read_json


def reverse_comment_dict(comment_dict):
    comments_reverse = {}
    for performer, comments in comment_dict.items():
        if not performer in comments_reverse:
            comments_reverse[performer] = {}
        for source, comment in comments.items():
            if not comment in comments_reverse[performer]:
                comments_reverse[performer][comment] = []
            comments_reverse[performer][comment].append(source)
    return comments_reverse


def write_html(
    e=None,
    template="",
    data={},
    path=("",),
    dataset=False,
    verbose=True,
    OUTPUT_DIR=OUTPUT_DIR,
    DATASET_OUTPUT_DIR=DATASET_OUTPUT_DIR,
):
    """The function that writes out any HTML to the correct path"""
    _path = path
    path = [OUTPUT_DIR]
    if dataset:
        path = [DATASET_OUTPUT_DIR]
    path.extend([x for x in _path])
    path.append("index.html")
    html_file = os.path.join(*path)
    Path(html_file).verify_parent()

    template = e.get_template(template)

    text = template.render(data=data)

    with open(html_file, "w+") as f:
        f.write(text)
        if verbose:
            print(f'html written to {html_file.replace(OUTPUT_DIR, "")}')
        return True

    return False


def copy_and_overwrite(from_path, to_path):
    if os.path.exists(to_path):
        shutil.rmtree(to_path)
    shutil.copytree(from_path, to_path)

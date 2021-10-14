from .settings import Settings
from pathlib import PosixPath
from shutil import copyfile
from slugify import slugify
import bs4
import json
import os
import re
import shutil
import unicodedata


def keyshift(dictionary, key, diff) -> object:
    """
    see https://stackoverflow.com/questions/28035490
    """
    if key in dictionary:
        token = object()
        keys = [token] * (diff * -1) + sorted(dictionary) + [token] * diff
        new_key = keys[keys.index(key) + diff]
        if new_key is token:
            return None
        else:
            return new_key
    else:
        return None


class Path(PosixPath):
    def verify_parent(self):
        if not self.parent.exists():
            self.parent.mkdir(parents=True)


    def write_json(self, obj):
        return self.write_text(json.dumps(obj))


    def read_json(self):
        return json.loads(self.read_text())


def reverse_comment_dict(comment_dict):
    comments_reverse = {}
    for performer, comments in comment_dict.items():
        if performer not in comments_reverse:
            comments_reverse[performer] = {}
        for source, comment in comments.items():
            if comment not in comments_reverse[performer]:
                comments_reverse[performer][comment] = []
            comments_reverse[performer][comment].append(source)
    return comments_reverse


def write_html(
        e=None,
        template="",
        data=None,
        path=("",),
        dataset=False,
        verbose=True,
        output_dir=Settings.OUTPUT_DIR,
        dataset_output_dir=Settings.DATASET_OUTPUT_DIR,
):
    """The function that writes out any HTML to the correct path"""
    if data is None:
        data = {}
    _path = path
    path = [output_dir]
    if dataset:
        path = [dataset_output_dir]
    path.extend([x for x in _path])
    path.append("index.html")
    html_file = os.path.join(*path)
    Path(html_file).verify_parent()

    template = e.get_template(template)

    text = template.render(data=data)

    with open(html_file, "w+") as f:
        f.write(text)
        if verbose:
            print(f'html written to {html_file.replace(output_dir, "")}')
        return True


def copy_and_overwrite(from_path, to_path):
    if os.path.exists(to_path):
        try:
            shutil.rmtree(to_path)
        except OSError as e:
            print(f'Error occurred: {e}. Will try again...')
            try:
                shutil.rmtree(to_path)
            except OSError as e:
                raise RuntimeError(f'Tried again and failed. Original error: {e}')
    else:
        print(f'Could not find directory {to_path}')
    shutil.copytree(from_path, to_path)


def slugify_node(value, verbose=False):
    init_value = str(value)
    value = init_value
    value = (
        unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    )
    value = re.sub(r"[^\w\s-]", "", value.lower())
    value = re.sub(r"^(\d+)", r"n\1", value)
    value = re.sub(r"[-\s]+", "_", value).strip("-_")
    if verbose:
        print(f"Making slug from {init_value}: {value}")
    return value


def get_abstract_from_html(html):
    soup = bs4.BeautifulSoup(html, "lxml")
    text = []
    for x in soup.html.body.p.children:
        if isinstance(x, bs4.element.NavigableString):
            text.append(x.strip())
    return " ".join(text)

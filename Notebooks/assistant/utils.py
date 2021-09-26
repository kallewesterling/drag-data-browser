from pathlib import Path
import json

def keyshift(dictionary, key, diff):
    ''' see https://stackoverflow.com/questions/28035490/in-python-how-can-i-get-the-next-and-previous-keyvalue-of-a-particular-key-in '''
    if key in dictionary:
        token = object()
        keys = [token]*(diff*-1) + sorted(dictionary) + [token]*diff
        newkey = keys[keys.index(key)+diff]
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

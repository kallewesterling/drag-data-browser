from jinja2 import Environment, FileSystemLoader
from slugify import slugify
from bs4 import BeautifulSoup
import bs4

import itertools
import json
import os
import re

from .dataframe import pd, dt, re, get_basic_df, extract_addresses_dict, get_comments, get_revue_comments_dict,  get_performer_comments_dict, get_venue_comments_dict, get_city_comments_dict, drop_columns

from .utils import keyshift, Path

from .clippings import make_performer_clippings, Clippings

from htmlmin import minify as minify_html

ARTISTS = re.compile(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]') # follows wikipedia standard
FOOTNOTES = re.compile(r'\[fn=([^\[]+)\]')

def minify_html(text):
    ''' a function that disables minify_html for the development phase '''
    return text

def slugify_node(value, allow_unicode=False, verbose=False):
    import unicodedata
    ''' this function comes from generate-cooccurrence-data.py '''
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
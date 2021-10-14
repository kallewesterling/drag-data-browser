from .dependencies import *
from .settings import Settings
from .dataframe import pd, dt, re, get_basic_df, extract_addresses_dict, get_comments, get_revue_comments_dict, get_performer_comments_dict, get_venue_comments_dict, get_city_comments_dict, drop_columns
from .utils import keyshift, Path, copy_and_overwrite, write_html, reverse_comment_dict, slugify_node, copyfile, slugify, get_abstract_from_html
from .clippings import make_performer_clippings, Clippings

'''
from jinja2 import FileSystemLoader
from htmlmin import minify as minify_html
import bs4
import itertools
import json
import os
import re
import time
'''

ARTISTS = re.compile(r'\[\[(?:[^|\]]*\|)?([^\]]+)\]\]')  # follows wikipedia standard
FOOTNOTES = re.compile(r'\[fn=([^\[]+)\]')


def minify_html(text):
    """ a function that disables minify_html for the development phase """
    return text

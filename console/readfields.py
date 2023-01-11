#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sys
import cgi
#from itertools import zip_longest
class dotdict(dict):
    """dot.notation access to dictionary attributes"""
    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__

def readfields(prams, default=None):
    results = dotdict()
    for pram in prams:
        results[pram] = default
    if len(sys.argv)>1:
        Z = zip(prams, sys.argv[1:])
        for z in Z:
            pram,val = z
            results[pram] = val
    else:
        form=cgi.FieldStorage()
        for pram in prams:
            if pram in form:
                results[pram]=form[pram].value
    return results

def default(val, d):
    if val == None:
        return d
    return val

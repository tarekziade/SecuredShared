import os
from uuid import uuid4
import smtplib

from bottle import route, run, static_file, request

here = os.path.dirname(__file__)


@route('/<filename>')
def js(filename):
    return static_file(filename, here)


@route('/')
def index():
    return static_file('index.html', here)


@route('/see')
def index():
    return static_file('see.html', here)


_URLS = {}

message = """From: SharedSecure <sharedsecure@ziade.org>
To: <%s>
Subject: SharedSecure file.

Someone has shared a file with you at %s
"""


@route('/notify')
def notify():
    rcpt = request.query['recipient']
    url = request.query['url']
    uid = str(uuid4())
    _URLS[uid] = rcpt, url
    msg = message % (rcpt, 'http://localhost:8000/see?uid=%s' % uid)
    smtp = smtplib.SMTP('localhost')
    smtp.sendmail("securedshared@ziade.org", [rcpt], msg)


def main():
    run(host='localhost', port=8000)


if __name__ == '__main__':
    main()

import os
from bottle import route, run, static_file

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



def main():
    run(host='localhost', port=8000)


if __name__ == '__main__':
    main()

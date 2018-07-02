import RequestJs from './index';

RequestJs(
  {
    url: '',
    params: {
      'lo': 23
    },
    headers: {
      'test': 'header'
    }
  },
  cb
)

RequestJs.get('URL', cb)

let a
a = RequestJs.parseHeaders('test')
a = RequestJs.parseHeaders({})

function cb (err, res) {
  console.log(err, res)
}

import RequestJs from './index'

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

console.log('Parse headers test 1', RequestJs.parseHeaders('test'))
console.log('Parse headers test 2', RequestJs.parseHeaders({}))

function cb (err, res) {
  console.log(err, res)
}

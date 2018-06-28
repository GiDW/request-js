import * as RequestJs from './index';

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

function cb (err, res) {
    console.log(err, res)
}

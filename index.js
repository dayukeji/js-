// 定义全局变量foo
var aa = 'foo1';

fn = () => console.log('ssdsds')
ctx = {
  fn: (val) => console.log(val),
  aa: '111'
}

const sand = (ctx, fnStr) => {
  with(window){
    eval(fnStr)
  }
  
}

sand(ctx, 'fn(aa)')
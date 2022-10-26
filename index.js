// 定义全局变量foo
var aa = 'foo1';

fn = () => console.log('ssdsds');
ctx = {
  fn: (val) => console.log(val),
  aa: '111',
};

const poorSand = (ctx, fnStr) => {
  with (window) {
    eval(fnStr);
  }
};

poorSand(ctx, 'fn(aa)');

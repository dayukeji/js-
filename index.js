// 方案1

// 定义全局变量foo
// var aa = 'foo1';

// fn = () => console.log('ssdsds');
// ctx = {
//   fn: (val) => console.log(val),
//   aa: '111',
// };

// const poorSand = (ctx, fnStr) => {
//   with (ctx) {
//     eval(fnStr);
//   }
// };

// poorSand(ctx, 'fn(aa)');

// 方案2

var foo = 'foo1';

// 执行上下文对象
const ctx = {
  func: (variable) => {
    console.log(variable);
  },
};

// 构造一个 with 来包裹需要执行的代码，返回 with 代码块的一个函数实例
function withedYourCode(code) {
  code = 'with(shadow) {' + code + '}';
  return new Function('shadow', code);
}

// 可访问全局作用域的白名单列表
const access_white_list = ['func'];

// 待执行程序
const code = `func(foo)`;

// 执行上下文对象的代理对象
const ctxProxy = new Proxy(ctx, {
  has: (target, prop) => {
    console.log('target', target);
    console.log('target.hasOwnProperty(prop);', target.hasOwnProperty(prop));

    // has 可以拦截 with 代码块中任意属性的访问
    if (access_white_list.includes(prop)) {
      // 在可访问的白名单内，可继续向上查找
      return target.hasOwnProperty(prop);
    }
    if (!target.hasOwnProperty(prop)) {
      throw new Error(`Not found - ${prop}!`);
    }
    return true;
  },
});

// 没那么简陋的沙箱
function littlePoorSandbox(ctx, code) {
  // 将 this 指向手动构造的全局代理对象
  withedYourCode(code).call(ctx, ctx);
}
littlePoorSandbox(ctxProxy, code);

// 执行func(foo)，报错： Uncaught Error: Not found - foo!

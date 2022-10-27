//   https://juejin.cn/post/7157570429928865828#heading-7
// 阿里面试官：请设计一个不能操作DOM和调接口的环境

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

//  const foo = 'code';
//  const code1 = 'func(foo)';

//  const ctx = {
//  func: (variable) => {
//  console.log(variable);
//  }
//  };

//  const withedYourCode = (code) => {
//  const newCode = `with(arg){ ${code} }`;
//  return new Function('arg', newCode);
//  };

// const proxy = new Proxy(ctx, {
//   has: (target, prop) => {
//     if (access_white_list.includes(prop)) {
//       // 如果在白名单，优先级最高，可继续向上查找（貌似如果是false, 会继续向上查找，如果是true则返回值）
//       return target.hasOwnProperty(prop);
//     }
//     if (!target.hasOwnProperty(prop)) {
//       throw new Error(`Not found - ${prop}!`);
//     }
//     return true;
//   },
// });

//  const littlePoorSandbox = (ctxProxy, code) => {
//  withedYourCode(code).call(ctxProxy, ctxProxy);
//  };
// proxy作用域，code1 具体域内代码
//  littlePoorSandbox(proxy, code1);

// 方案3

// 沙箱全局代理对象类
// class SandboxGlobalProxy {
//   constructor(sharedState) {
//     // 创建一个 iframe 标签，取出其中的原生浏览器全局对象作为沙箱的全局对象
//     const iframe = document.createElement('iframe', { url: 'about:blank' });
//     iframe.style.display = 'none';
//     document.body.appendChild(iframe);

//     // sandboxGlobal作为沙箱运行时的全局对象
//     const sandboxGlobal = iframe.contentWindow;

//     return new Proxy(sandboxGlobal, {
//       has: (target, prop) => {
//         // has 可以拦截 with 代码块中任意属性的访问
//         if (sharedState.includes(prop)) {
//           // 如果属性存在于共享的全局状态中，则让其沿着原型链在外层查找
//           return false;
//         }

//         // 如果没有该属性，直接报错
//         if (!target.hasOwnProperty(prop)) {
//           throw new Error(`Not find: ${prop}!`);
//         }

//         // 属性存在，返回sandboxGlobal中的值
//         return true;
//       },
//     });
//   }
// }

// // 构造一个 with 来包裹需要执行的代码，返回 with 代码块的一个函数实例
// function withedYourCode(code) {
//   code = 'with(sandbox) {' + code + '}';
//   return new Function('sandbox', code);
// }
// function maybeAvailableSandbox(code, ctx) {
//   withedYourCode(code).call(ctx, ctx);
// }

// // 要执行的代码
// const code = `
//   console.log(history == window.history) // false
//   window.abc = 'sandbox'
//   Object.prototype.toString = () => {
//       console.log('Traped!')
//   }
//   console.log(window.abc) // sandbox
// `;

// // sharedGlobal作为与外部执行环境共享的全局对象
// // code中获取的history为最外层作用域的history
// const sharedGlobal = ['history'];

// const globalProxy = new SandboxGlobalProxy(sharedGlobal);

// maybeAvailableSandbox(code, globalProxy);

// // 对外层的window对象没有影响
// console.log(window.abc); // undefined
// Object.prototype.toString(); // 并没有打印 Traped

// 方案4

// 沙箱全局代理对象类
// class SandboxGlobalProxy {
//   constructor(blacklist) {
//     // 创建一个 iframe 标签，取出其中的原生浏览器全局对象作为沙箱的全局对象
//     const iframe = document.createElement("iframe", { url: "about:blank" });
//     iframe.style.display = "none";
//     document.body.appendChild(iframe);

//     // 获取当前HTMLIFrameElement的Window对象
//     const sandboxGlobal = iframe.contentWindow;

//     return new Proxy(sandboxGlobal, {
//       // has 可以拦截 with 代码块中任意属性的访问
//       has: (target, prop) => {

//         // 黑名单中的变量禁止访问
//         if (blacklist.includes(prop)) {
//           throw new Error(`Can't use: ${prop}!`);
//         }
//         // sandboxGlobal对象上不存在的属性，直接报错，实现禁用三方库调接口
//         if (!target.hasOwnProperty(prop)) {
//           throw new Error(`Not find: ${prop}!`);
//         }

//         // 返回true，获取当前提供上下文对象中的变量；如果返回false，会继续向上层作用域链中查找
//         return true;
//       }
//     });
//   }
// }

// // 使用with关键字，来改变作用域
// function withedYourCode(code) {
//   code = "with(sandbox) {" + code + "}";
//   return new Function("sandbox", code);
// }

// // 将指定的上下文对象，添加到待执行代码作用域的顶部
// function makeSandbox(code, ctx) {
//   withedYourCode(code).call(ctx, ctx);
// }

// // 待执行的代码code，获取document对象
// const code = `console.log(document)`;

// // 设置黑名单
// // 经过小伙伴的指导，新添加Image字段，禁止使用new Image来调接口
// const blacklist = ['window', 'document', 'XMLHttpRequest', 'fetch', 'WebSocket', 'Image'];

// // 将globalProxy对象，添加到新环境作用域链的顶部
// const globalProxy = new SandboxGlobalProxy(blacklist);

// makeSandbox(code, globalProxy);

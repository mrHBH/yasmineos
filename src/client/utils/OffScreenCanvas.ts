// class ElementProxyReceiver extends THREE.EventDispatcher {
// 	constructor() {
// 		super();
// 	}
// 	handleEvent(data) {
// 		this.dispatchEvent(data);
// 	}
// }

// class ProxyManager {
// 	targets: {};
// 	constructor() {
// 		this.targets = {};
// 		this.handleEvent = this.handleEvent.bind(this);
// 	}
// 	makeProxy(data) {
// 		const { id } = data;
// 		const proxy = new ElementProxyReceiver();
// 		this.targets[id] = proxy;
// 	}
// 	getProxy(id) {
// 		return this.targets[id];
// 	}
// 	handleEvent(data) {
// 		this.targets[data.id].handleEvent(data.data);
// 	}
// }
// const proxyManager = new ProxyManager();

// function start(data) {
// 	const proxy = proxyManager.getProxy(data.canvasId);
// 	init({
// 		canvas: data.canvas,
// 		inputElement: proxy,
// 	});
// }

// function makeProxy(data) {
// 	proxyManager.makeProxy(data);
// }

// const handlers = {
// 	init,
// 	mouse,
// 	start,
// 	makeProxy,
// 	event: proxyManager.handleEvent,
// 	size,
// };

// self.onmessage = function (e) {
// 	const fn = handlers[e.data.type];
// 	if (!fn) {
// 		throw new Error("no handler for type: " + e.data.type);
// 	}
// 	fn(e.data);
// };

requirejs.config({
	paths: {
		namespaces: 'namespaces',
		Injector: 'Injector',
		InjectorUtils: 'InjectorUtils',
		InjectionMapping: 'InjectionMapping'
	},

	shim: {
		"Injector": {
			"deps": ["namespaces"]
		},

		"InjectorUtils": {
			"deps": ["Injector"]
		},

		"InjectionMapping": {
			"deps": ["Injector"]
		}
	}
});

require(["namespaces",
		 "Injector",
		 "InjectorUtils",
		 "InjectionMapping"],

	function () {

	}
);
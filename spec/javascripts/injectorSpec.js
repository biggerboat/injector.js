describe("Injector", function() {
	var injector;

	beforeEach(function() {
		injector = new window.injector.Injector();
	});

	it("Has a defined injector", function() {
		expect(injector).not.toBeNull();
	});

	it("Injects a basic type by variable name", function() {
		var someValue = "Hello World";
		injector.map('someValue').toValue(someValue);

		var someObject = {
			someValue: 'inject'
		};
		injector.injectInto(someObject);

		expect(someObject.someValue).toBe(someValue);
	});

	it("Injects a newly created type by variable name", function() {
		var SomeClass = function() {
			console.log('SomeClass -> SomeClass');
			this.hello = "Hello World";
		};
		injector.map('someValue').toType(SomeClass);

		var someObject = {
			someValue: 'inject'
		};
		injector.injectInto(someObject);

		expect(someObject.someValue.hello).toBe("Hello World");
	});

	it("Injects a specific type that doesn't have anything to do with the variable name", function() {
		var someValue = "Hello World";
		injector.map('someValue').toValue(someValue);

		var someObject = {
			otherValue: 'inject:someValue'
		};
		injector.injectInto(someObject);

		expect(someObject.otherValue).toBe(someValue);
	});

	it("injects an object by name", function() {
		var someValue1 = "Hello World 1";
		var someValue2 = "Hello World 2";

		injector.map('someValue', 'one').toValue(someValue1);
		injector.map('someValue', 'two').toValue(someValue2);

		var someObject1 = {
			someValue: 'inject(name="one")'
		};
		injector.injectInto(someObject1);

		var someObject2 = {
			someValue: 'inject(name="two")'
		};
		injector.injectInto(someObject2);

		expect(someObject1.someValue).toBe(someValue1);
		expect(someObject2.someValue).toBe(someValue2);
	});

	it("Injects a named specific type that doesn't have anything to do with the variable name", function() {
		var someValue1 = "Hello World 1";
		var someValue2 = "Hello World 2";

		injector.map('someValue', 'one').toValue(someValue1);
		injector.map('someValue', 'two').toValue(someValue2);

		var someObject = {
            otherValue1: 'inject(name="one"):someValue',
            otherValue2: 'inject(name="two"):someValue'
		};
		injector.injectInto(someObject);

		expect(someObject.otherValue1).toBe(someValue1);
        expect(someObject.otherValue2).toBe(someValue2);
	});

	it("Calls post constructs", function() {
		var someValue = "Hello World";
		injector.map('someValue').toValue(someValue);

		var someObject = {
			postConstructs: ['onPostConstruct'],
			counter: 0,
			someValue: 'inject',

			onPostConstruct: function() {
				this.counter++;
				console.log('someObject -> onPostConstruct', this, this.counter);
			}
		};
		injector.injectInto(someObject);

		expect(someObject.counter).toBe(1);
	});

	it("Calls post constructs and injects on a newly created instance", function() {
		var someValue = "Hello World";
		injector.map('someValue').toValue(someValue);

		var MyClass = function () {};
		MyClass.prototype = {
			postConstructs: ['onPostConstruct'],
			counter: 0,
			someValue: 'inject',

			onPostConstruct: function() {
				this.counter++;
				console.log('someObject -> onPostConstruct', this, this.counter);
			}
		};
		var someObject = new MyClass();
		injector.injectInto(someObject);

		expect(someObject.counter).toBe(1);
		expect(someObject.someValue).toBe(someValue);
	});

	it("returns an instance", function() {
		var someObject = function(){};
		someObject.prototype = { testVar: 'test'};

		injector.map('someObject').toType(someObject);

		var someCreatedObject1 = injector.getInstance('someObject');

		expect(someCreatedObject1.testVar).toEqual('test');
	});

	it("returns two unique instances", function() {
		var someObject = function(){};
		someObject.prototype = { testVar: 'test'};

		injector.map('someObject').toType(someObject);

		var someCreatedObject1 = injector.getInstance('someObject');
		var someCreatedObject2 = injector.getInstance('someObject');
		someCreatedObject2.testVar = 'hello world';

		expect(someCreatedObject1.testVar).not.toEqual(someCreatedObject2.testVar);
	});

	it("returns the same singleton instance", function() {
		var someObject = function(){};
		someObject.prototype = { testVar: 'test'};

		injector.map('someObject').toSingleton(someObject);

		var someCreatedObject1 = injector.getInstance('someObject');
		var someCreatedObject2 = injector.getInstance('someObject');
		someCreatedObject2.testVar = 'hello world';

		expect(someCreatedObject1.testVar).toEqual(someCreatedObject2.testVar);
	});

	it("returns a specific error when there is no mapping", function() {
		expect(function(){injector.getInstance('someObject')}).toThrow(new Error('Cannot return instance "someObject" because no mapping has been found'));
		expect(function(){injector.getInstance('someObject', 'someName')}).toThrow(new Error('Cannot return instance "someObject by name someName" because no mapping has been found'));
	});

	it("can unmap mappings by type", function() {
		var someValue = "Hello World";
		injector.map('someValue').toValue(someValue);
		expect(injector.getInstance('someValue')).toBe(someValue);

		injector.unmap('someValue');

		expect(function(){injector.getInstance('someValue')}).toThrow(new Error('Cannot return instance "someValue" because no mapping has been found'));
	});

	it("can unmap mappings by type and name", function() {
		var someValue = "Hello World";
		injector.map('someValue', 'myName').toValue(someValue);
		expect(injector.getInstance('someValue', 'myName')).toBe(someValue);

		injector.unmap('someValue', 'myName');

		expect(function(){injector.getInstance('someValue', 'myName')}).toThrow(new Error('Cannot return instance "someValue by name myName" because no mapping has been found'));
	});

	it("registers itself by the injector", function() {
		expect(injector.getInstance('injector')).toBe(injector);
	});

	it("can teardown itself (aka. unmapAll)", function() {
		var someValue = "Hello World";
		injector.map('someValue').toValue(someValue);
		expect(injector.getInstance('someValue')).toBe(someValue);
		injector.map('someValue2').toValue(someValue);
		expect(injector.getInstance('someValue2')).toBe(someValue);

		injector.teardown();

		expect(function() {injector.getInstance('someValue')}).toThrow(new Error('Cannot return instance "someValue" because no mapping has been found'));
		expect(function() {injector.getInstance('someValue2')}).toThrow(new Error('Cannot return instance "someValue2" because no mapping has been found'));
	});

	describe("childInjector", function() {

		it("can create a childInjector which references to its parent", function() {
			var childInjector = injector.createChildInjector();

			expect(childInjector).not.toBeNull();
			expect(childInjector.getParentInjector()).toBe(injector);
			expect(childInjector).not.toBe(injector);
		});

		it("has no parentInjector when it is the top parent", function() {
			expect(injector.getParentInjector()).toBeNull();

			var childInjector = injector.createChildInjector();
			expect(injector.getParentInjector()).toBeNull();
		});

		it("validates mappings on a child that stem from its parent as if it were its own mappings", function() {
			var childInjector = injector.createChildInjector();

			expect(injector.hasMapping('someValue')).toBe(false);
			expect(childInjector.hasMapping('someValue')).toBe(false);

			var someValue = "Hello World";
			injector.map('someValue').toValue(someValue);

			expect(injector.hasMapping('someValue')).toBe(true);
			expect(childInjector.hasMapping('someValue')).toBe(true);
		});

		it("hides mappings from its parent", function() {
			var childInjector = injector.createChildInjector();
			var someValue = "Hello World";
			childInjector.map('someValue').toValue(someValue);

			expect(childInjector.hasMapping('someValue')).toBe(true);
			expect(injector.hasMapping('someValue')).toBe(false);
		});

		it("returns the instance that was mapped on the parent", function() {
			var childInjector = injector.createChildInjector();

			var someValue = "Hello World";
			injector.map('someValue').toValue(someValue);

			expect(injector.getInstance('someValue')).toBe(someValue);
			expect(childInjector.getInstance('someValue')).toBe(someValue);
		});

		it("throws an error when the parent tries to get access to a mapping that was only mapped on the childInjector", function() {
			var childInjector = injector.createChildInjector();
			var someValue = "Hello World";
			childInjector.map('someValue').toValue(someValue);

			expect(childInjector.getInstance('someValue')).toBe(someValue);
			expect(function() {injector.getInstance('someValue')}).toThrow(new Error('Cannot return instance "someValue" because no mapping has been found'));
		});

		it("can create multiple child injectors", function() {
			var injectorChild1 = injector.createChildInjector(),
				injectorChild2 = injector.createChildInjector(),
				injector1Child = injectorChild1.createChildInjector();

			expect(injector.getParentInjector()).toBeNull();
			expect(injectorChild1.getParentInjector()).toBe(injector);
			expect(injectorChild2.getParentInjector()).toBe(injector);
			expect(injector1Child.getParentInjector()).toBe(injectorChild1);
		});

		it("can access mappings from a parent multiple levels up", function() {
			var injectorChild1 = injector.createChildInjector(),
				injector1Child = injectorChild1.createChildInjector();

			var someValue = "Hello World";
			injector.map('someValue').toValue(someValue);
			var otherValue = "Hello child!";
			injectorChild1.map('otherValue').toValue(otherValue);

			expect(injector.getInstance('someValue')).toBe(someValue);
			expect(injectorChild1.getInstance('someValue')).toBe(someValue);
			expect(injector1Child.getInstance('someValue')).toBe(someValue);

			expect(injectorChild1.getInstance('otherValue')).toBe(otherValue);
			expect(injector1Child.getInstance('otherValue')).toBe(otherValue);
		});

		it("can create mappings for keys that already exist on the parent", function() {
			var injectorChild = injector.createChildInjector();

			var someValue = "Hello World";
			injector.map('someValue').toValue(someValue);
			var otherValue = "Hello child!";

			expect(function() {
				injectorChild.map('someValue').toValue(otherValue);
			}).not.toThrow(new Error('Already has mapping for someValue'));
		});

		it("force maps itself as the injector", function() {
			var injectorChild = injector.createChildInjector();

			expect(injector).not.toBe(injectorChild);
			expect(injector.getInstance('injector')).toBe(injector);
			expect(injectorChild.getInstance('injector')).toBe(injectorChild);
		});

	});


});
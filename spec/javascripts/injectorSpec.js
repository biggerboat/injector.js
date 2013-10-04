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

});
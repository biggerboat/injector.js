require.config({
	baseUrl: "../../assets/js/"
});

require(["main"],

	function () {
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
				injector.injectInto(someObject)

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

			it("Injects a named specific type that doesn't have anything to do with the variable name", function() {
				var someValue1 = "Hello World 1";
				var someValue2 = "Hello World 2";

				injector.map('someValue', 'one').toValue(someValue1);
				injector.map('someValue', 'two').toValue(someValue2);

				var someObject = {
					test: function() {},
					otherValue: 'inject(name="one"):someValue'
				};
				injector.injectInto(someObject);

				expect(someObject.otherValue).toBe(someValue1);
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
		});
	}
);
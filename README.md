#Injector.js [![Build Status](https://travis-ci.org/biggerboat/injector.js.png)](https://travis-ci.org/biggerboat/injector.js)
This library is a simple JavaScript dependency injector inspired by [SwiftSuspenders](https://github.com/tschneidereit/SwiftSuspenders)

***
## Testsuite
A Jasmine testsuite is provided to test all of the supported features by the injector. This operates also a good reference to see the API in action.

***
## Examples
An example implementation of how you could use the injector can be found at [Navigator-Injector-Backbone-Command-TodoMVC example](https://github.com/BiggerBoat/nibc-todomvc)

### Inject a basic type by variable name
#### Step 1: Setup
Instantiate the injector and create a variable which we would like to inject into another object
```JavaScript
var injector = new injector.Injector();
var myValue = "Hello world";
```

#### Step 2: Map
Configure the value to be registred as type `myType`
```JavaScript
injector.map('myType').toValue(myValue);
```
This exposes whatever is assigned to `myValue` (in this case the string "Hello world") under the key `myType`.

#### Step 3: The object to inject into
Define the object that needs to be injected into. This is nothing more than a regular object with a special property and value.
```JavaScript
var objectToInjectInto = {
	myType: "inject"
};
```
Because we just mapped `myType` in step 2, we need to use this name here, else we can not inject. Also notice the "inject" string. Based on this string we know that we can lookup `myType` in the injector and assign its value to the object.

#### Step 4: Apply dependency injection
To inject the `objectToInjectInto` with the required objects it requires we add the following code.

	injector.injectInto(objectToInjectInto);
Once this code has ben excecuted objectToInjectInto.myType no longer holds a reference to the "inject" string, but will be replaced by "Hello world"

Method `injector.injectInto(…)` will loop through all the properties of the object that has been passed as a reference. Once it encounters an "inject" value, it will lookup if there is an injection rule defined for the object under this name and replaces the "inject" string by this value. In case injection fails, a meaningful error will be returned, pointing you in the right direction to solve the issue.

#### Summary
The for steps above are the minimal amount of steps to put the dependency injection to work in its most simplistic form. All steps combined together takes just a few lines of code:
```JavaScript
var injector = new injector.Injector();
var myValue = "Hello world";
injector.map('myType').toValue(myValue);

var objectToInjectInto = {
	myType: "inject"
};
injector.injectInto(objectToInjectInto);
```
***

### Manually getting values from the injector
Lets assume we have configured the same injection rules as in the previous example:
```JavaScript
var injector = new injector.Injector();
var myValue = "Hello world";
injector.map('myType').toValue(myValue);
```
In order to get "Hello world" out of the injector we can just call:
```JavaScript
injector.getInstance('myType');
```
***
	
### More advanced/Real world usage
Though the above sounds nice, its a bit to complex for just passing on one string to another object. It gets more interesting when you have lots of objects that needs to be injected in many other objects. 

Essentially the string "Hello world" from our previous example is just an object. Thus the injector is perfectly capable of working with mapping objects. So one could for example do the following:
```JavaScript
var someObject = {a: 'b', c: 'd'};
injector.map('myType').toValue(someObject);
```

#### Injecting a singleton value
Say you have a class that needs to be used as a singleton within your application. You could make a real singleton, but we all should have learned that [singletons are bad practice](http://www.google.com/search?q=why+is+singleton+pattern+bad). Using the approach with dependency injection takes away the arguments not to use it.
Creating a singleton out of the class `MyModel` would be as easy as this:

```JavaScript
injector.map('myModel').toSingleton(MyModel);
```
Under the hood this is just the same as:
```JavaScript	
var myModelInstance = new MyModel();
injector.map('myModel').toValue(myModelInstance);
```
In other words we just create an instance once and pass it on every time `myModel` is requested. 

#### Injecting new instances
Lets assume again that you have a class `MyModel`. But instead of mapping the same instance into each object, you just want to map it to a new and unique instance every time. To achieve this, you just need to map it as following:
```JavaScript
injector.map('myModel').toType(MyModel);
```
Now every time a new model will be returned when a model is requested. One might ask himself why that would be useful as the instance is always unique and won't be shared with other objects. A good use case would be the situation where you would like to switch from one type to another. Say you have a special model that you use during development, but needs to be changed by a more different version for production. In that case you could use this during development:
```JavaScript
injector.map('myModel').toType(MyDevModel);
```
Once switching to production you could just switch this to:
```JavaScript	
injector.map('myModel').toType(MyProductionModel);
```
After that all instances will be created using this production model.
Off course, you need to make sure that this object supports all methods and properties that you will use in the rest of your code.
A big advantage is that you can switch this at a central location within your application, even though many other classes make use of this same "myModel".

#### Types
The first argument to an injector.map(…) call is named "type". I'd like to think of a type as the concept of a datatype. By giving this a proper name it would become more clear which data to expect. So lets say I want to inject an instance of `MyModel`, I will map it as `myModel`:
```JavaScript
injector.map('myModel').toValue(myModelInstance);
var objectToInjectInto = {
	myModel: "inject"
};
```

When we choose a different name for the the type, such as a generic name `model` for example, it would become unclear which data type to expect:
```JavaScript	
injector.map('model').toValue(myModelInstance);
var objectToInjectInto = {
	model: "inject"
};
```
Though this code is perfectly valid, this will especially become unclear when there are many models to be injected.

##### Injecting a different type
In case you will find yourself in some situation where you want to inject into a different type than the type that was passed to the injector, you could simply specify this by a colon:
```JavaScript
injector.map('myModel').toSingleton(MyModel);
var objectToInjectInto = {
	model : "inject:myModel"
}
injector.injectInto(objectToInjectInto);
```
So in this case "model" will be ignored and we just do a lookup in the injector for "myModel";

##### Named injection
There are use-cases where one needs to map multiple instances of the same type to the injector. A good example would be when you have multiple pages within your application, each requirring an instance of the same class `PageModel`. In order to do this you could use named injection. To put this to work you can provide a second argument to the `map(…)` method:

```JavaScript
injector.map('pageModel', 'home').toSingleton(PageModel);
injector.map('pageModel', 'about').toSingleton(PageModel);
injector.map('pageModel', 'contact').toSingleton(PageModel);
```

While injecting a page into another object you could reference to this second argument
```JavaScript
var homeView = {
	pageModel: 'inject(name="home")'
};

var aboutView = {
	pageModel: 'inject(name="about")'
};

injector.injectInto(homeView);
injector.injectInto(aboutView);
```

##### Combined different type and named injection
For really advanced usage you could also combine this with a different type identifier:

```JavaScript
injector.map('pageModel', 'home').toSingleton(PageModel);
injector.map('pageModel', 'about').toSingleton(PageModel);

var homeView = {
	model: 'inject(name="home"):pageModel'
};

var aboutView = {
	model: 'inject(name="about"):pageModel'
};

injector.injectInto(homeView);
injector.injectInto(aboutView);
```	
	
#### Postconstructs
Because injection always takes place **after** the object has been instantiated you could not make use of the "soon to be injected" properties. A postConstruct will help with this and is in fact nothing more than a method to be called on the object after injection.

To define the postConstruct method you need to define an array `postConstructs` as a class property on the object you would like to inject into.

```JavaScript
injector.map('myModel').toSingleton(MyModel);
var objectToInjectInto = {
	postConstructs: ['onPostConstruct'],
	myModel : "inject",
	
	onPostConstruct: function() {
		console.log("myModel has been injected with", this.myModel)
	}
}
injector.injectInto(objectToInjectInto); 
```
	
In most cases you probably just want one method to be called, but you could define multiple methods in the array.
When the `postConstructs` array is not defined, or empty, nothing will be called after injection.
	
***

## Dependencies
This library is completely independent from other libraries.


## Framework support
You should be able to use the dependency injector together with other frameworks and libraries. As far as my experience goes I have used this in combination with [Backbone.js](https://github.com/documentcloud/backbone/). I have extended Backbone.View, so all my views can automatically be injected by the models of my need. 
I might add an implementation of this later to Github.

## Running the specs

Injector.js was build with [TDD](http://en.wikipedia.org/wiki/Test-driven_development). We created a test suite with [Jasmine gem](https://github.com/pivotal/jasmine-gem). Every commit and pull requests gets tested with [Travis-ci](https://travis-ci.org/biggerboat/injector.js).

You can run the test locally by installing Ruby 2.x.x. For more information on how to install Ruby check the [Rbenv](https://github.com/sstephenson/rbenv#installation) installation guide.

When you have Ruby and Bundler installed run this command to install all dependencies:

	$ bundle install

To see the tests in a browser run this command:

	$ bundle exec rake jasmine

Then open your browser with this url; [http://localhost:8888/](http://localhost:8888/)

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request from Github

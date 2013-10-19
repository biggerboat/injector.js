injector.Injector = function(parentInjector) {
	this._mappings = {};
	this._parentInjector = null;

	this._createMapping = function(type, name, id) {
		if(this._hasOwnMapping(type, name)) {
			throw new Error("Already has mapping for " + type);
			return;
		}

		var mapping = new injector.InjectionMapping(type, name, id);
		this._mappings[id] = mapping;

		return mapping;
	};

	this._getMappingID = function (type, name) {
		name = name == undefined ? '' : name;
		return type + '|' + name;
	};

	this._hasOwnMapping = function(type, name) {
		var mappingID = this._getMappingID(type, name);
		return (this._mappings[mappingID] !== undefined);
	};

	this._postConstruct = function(object) {
		var postConstructs = object.postConstructs!== undefined ? object.postConstructs instanceof Array ? object.postConstructs : [] : [],
			index,
			methodName,
			method;

		for(index in postConstructs) {
			methodName = postConstructs[index];
			method = object[methodName]=== undefined ? null : object[methodName];

			if(typeof method === 'function') {
				method.apply(object);
			}
		}
	};
	
	this.map('injector').toValue(this);
	this._parentInjector = parentInjector || null;
};

injector.Injector.prototype = {

	map: function(type, name) {
		var mappingID = this._getMappingID(type, name);
		return this._mappings[mappingID] || this._createMapping(type, name, mappingID);
	},

	unmap: function(type, name) {
		if(this.hasMapping(type, name)) {
			var mappingID = this._getMappingID(type, name);
			delete this._mappings[mappingID];
		} else {
			var nameError = name == undefined ? "" : " by name "+ name;
			throw new Error("Cannot unmap \"" + type + nameError + "\" because no mapping has been found");
		}
	},

	hasMapping: function(type, name) {
		return this._hasOwnMapping(type, name) || (this._parentInjector !== null && this._parentInjector.hasMapping(type, name));
	},

	getInstance: function(type, name) {
		if(this.hasMapping(type, name)) {
			return this.getMapping(type, name).getValue();
		} else {
			var nameError = name == undefined ? "" : " by name "+ name;
			throw new Error("Cannot return instance \"" + type + nameError + "\" because no mapping has been found");
		}
	},

	getMapping: function(type, name) {
		if(this.hasMapping(type, name)) {
			var mappingID = this._getMappingID(type, name);
			if(this._mappings[mappingID] !== undefined) {
				return this._mappings[mappingID];
			} else {
				return this.getParentInjector().getMapping(type, name);
			}
		} else {
			var nameError = name == undefined ? "" : " by name "+ name;
			throw new Error("Mapping \"" + type + nameError + "\" was not found");
		}
	},

	injectInto: function(object) {
		var member, injectionObject;

		for (member in object) {

			injectionObject = injector.utils.stringToObject(member, object[member]);

			if(injectionObject!=null) {
				if(this.hasMapping(injectionObject.type, injectionObject.name)) {
					object[member] = this.getInstance(injectionObject.type, injectionObject.name);
				} else {
					throw new Error("Cannot inject "+injectionObject.type+" into "+object+" due to a missing rule");
				}
			}
		}

		this._postConstruct(object);
	},

	teardown: function() {
		this._mappings = {};
		this.map('injector').toValue(this);
	},

	getParentInjector: function() {
		return this._parentInjector;
	},

	setParentInjector: function(parentInjector) {
		if(parentInjector != null && !(parentInjector instanceof injector.Injector)) {
			throw new Error('Cannot set the parentInjector because it is not an injector');
		}

		this._parentInjector = parentInjector;
	},

	createChildInjector: function() {
		return new injector.Injector(this);
	}

};
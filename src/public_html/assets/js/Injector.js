injector.Injector = function() {
	this._mappings = {};

	this._createMapping = function(type, name, id) {
		if(this.hasMapping(type, name)) {
			throw new Error("Already has mapping for " + type);
			return;
		}

		var mapping = new injector.InjectionMapping(type, name, id);
		this._mappings[id] = mapping;

		return mapping;
	}

	this._getMappingID = function (type, name) {
		name = name == undefined ? '' : name;
		return type + '|' + name;
	}

	this._postConstruct = function(object) {
		var postConstructs = object.hasOwnProperty("postConstructs") ? object["postConstructs"] instanceof Array ? object["postConstructs"] : [] : [],
			index,
			methodName,
			method;
		
		for(index in postConstructs) {
			methodName = postConstructs[index];
			method = object.hasOwnProperty(methodName) ? object[methodName] : null;

			if(typeof method === 'function') {
				method.apply(object);
			}
		}
	}
};

injector.Injector.prototype = {

	map: function(type, name) {
		var mappingID = this._getMappingID(type, name);
		return this._mappings[mappingID] || this._createMapping(type, name, mappingID);
	},

	hasMapping: function(type, name) {
		var mappingID = this._getMappingID(type, name);
		return this._mappings.hasOwnProperty(mappingID);
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
            return this._mappings[mappingID];
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
	}
};
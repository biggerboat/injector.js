injector.InjectionMapping = function(type, name, id) {
	this._type = type;
	this._name = name;
	this._id = id;

	this._value = null;
	this._toType = null;

	this._isValid = function() {
		return this._value!=null || this._toType!=null;
	};

	this._validateBeforeCreation = function() {
		if(this._isValid()) {
			throw new Error("Could not create mapping for "+this._id+" because it already has been defined");
			return false;
		}

		return true;
	};
};

injector.InjectionMapping.prototype = {
	toValue: function(value) {
		if(!this._validateBeforeCreation()) {
			return;
		}

		this._value = value;
	},

	toType: function(type) {
		if(!this._validateBeforeCreation()) {
			return;
		}

		this._toType = type;
	},

	toSingleton: function(type) {
		this.toValue(new type());
	},

	getValue: function() {
		if(!this._isValid()) {
			throw new Error("Could not get value for "+this._id+" because the mapping is invalid");
			return;
		}

		if(this._value!=null) {
			return this._value;
		} else if(this._toType!=null) {
			return new this._toType();
		}
	}
};
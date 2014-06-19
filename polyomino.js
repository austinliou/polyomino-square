var shapeFactory = {
	dot: function(){
		return new Shape(
			[0],
			[0],
			[0,0]
		);
	},
	line2: function(){
		return new Shape(
			[0,0],
			[0,1],
			[0,0]
		);
	},
	line3: function(){
		return new Shape(
			[0,0,0],
			[0,1,2],
			[0,1]
		);
	},
	corner3: function(){
		return new Shape(
			[0,1,0],
			[0,0,1],
			[0,0]
		);
	},
	line4: function(){
		return new Shape(
			[0,0,0,0],
			[0,1,2,3],
			[0,1]
		);
	},
	el4: function(){
		return new Shape(
			[0,0,0,1],
			[0,1,2,2],
			[0,2]
		);
	},
	tee4: function(){
		return new Shape(
			[0,0,0,1],
			[0,1,2,1],
			[0,1]
		);
	},
	square4: function(){
		return new Shape(
			[0,0,1,1],
			[0,1,0,1],
			[0,0]
		);
	},
	zig4: function(){
		return new Shape(
			[0,0,1,1],
			[0,1,1,2],
			[0,1]
		);
	},
	line5: function(){
		return new Shape(
			[0,0,0,0,0],
			[0,1,2,3,4],
			[0,2]
		);
	},
	el5: function(){
		return new Shape(
			[0,0,0,0,1],
			[0,1,2,3,3],
			[0,3]
		);
	},
	zig5: function(){
		return new Shape(
			[0,0,0,1,1],
			[0,1,2,2,3],
			[0,2]
		);
	},
	thumb5: function(){
		return new Shape(
			[0,0,1,1,2],
			[0,1,0,1,0],
			[1,0]
		);
	},
	you5: function(){
		return new Shape(
			[0,1,0,0,1],
			[0,0,1,2,2],
			[0,1]
		);
	},
	baton5: function(){
		return new Shape(
			[0,0,0,0,1],
			[0,1,2,3,2],
			[0,2]
		);
	},
	tee5: function(){
		return new Shape(
			[0,0,0,1,2],
			[0,1,2,1,1],
			[0,1]
		);
	},
	corner5: function(){
		return new Shape(
			[0,0,0,1,2],
			[0,1,2,2,2],
			[0,2]
		);
	},
	w5: function(){
		return new Shape(
			[0,1,1,2,2],
			[0,0,1,1,2],
			[1,1]
		);
	},
	f5: function(){
		return new Shape(
			[0,0,1,2,1],
			[0,1,1,1,2],
			[1,1]
		);
	},
	cross5: function(){
		return new Shape(
			[1,1,1,0,2],
			[0,1,2,1,1],
			[1,1]
		);
	}
};

//==========================================================================

//Initialize an array with set length and value
function initArray(len, val){
	var arr = [];
	for(var i=0; i<len; i++){
		arr[i] = val;
	}
	return arr;
}
//==========================================================================
function Shape(x,y,origin,offset){
	this.x = x;
	this.y = y;
	this.size = this.calculateSize();
	this.origin = (typeof origin == "undefined" ? [Math.floor(this.size[0]/2), Math.floor(this.size[1]/2)] : origin);
	this.offset = (typeof offset == "undefined" ? [0,0] : offset);
	this.normalize();
}

Shape.prototype.calculateSize = function(){
	var xMax = Math.max();	//wtf
	var yMax = Math.max();
	var xMin = Math.min();
	var yMin = Math.min();
	for(var i=0; i<this.x.length; i++){
		xMax = Math.max(xMax, this.x[i]);
		yMax = Math.max(yMax, this.y[i]);
		xMin = Math.min(xMin, this.x[i]);
		yMin = Math.min(yMin, this.y[i]);
	}
	return [xMax-xMin+1, yMax-yMin+1];
};

//Return this shape as a BinShape object (binary array representation)
Shape.prototype.toBinShape = function(){
	//Assuming shape is normalized, to avoid indexing errors
	var binArr = initArray(this.size[0]*this.size[1], 0);
	//Fill binary values
	for(var i=0; i<this.x.length; i++){
		binArr[this.y[i]*this.size[0]+this.x[i]] = 1;
	}
	return new BinShape(binArr, [this.size[0], this.size[1]], [this.offset[0],this.offset[1]]);
};

//Calculate whether shape intersects another shape
Shape.prototype.intersects = function(shape){
	//O(m*n) where m,n = # blocks in each polyomino, respectively; this can be faster if coordinate lists are sorted
	for(var i=0; i<this.x.length; i++){
		for(var j=0; j<shape.x.length; j++){
			if(this.x[i]+this.offset[0] == shape.x[j]+shape.offset[0] && this.y[i]+this.offset[1] == shape.y[j]+shape.offset[1]){
				return true;
			}
		}
	}
	return false;
};

//Rotate a shape clockwise n times; returns rotated shape
//Equivalent transformation is rotate about [0,0], then translate back to local origin
Shape.prototype.rotate = function(n){
	n%=4;
	//Keep track of old origin and offset so we can calculate the "absolute shape origin" and translate the shape back after rotation
	var oldAbsOrigin = [this.offset[0]+this.origin[0], this.offset[1]+this.origin[1]];
	var newAbsOrigin;
	switch(n){
		case 0:	//No rotation
			return this;
		case 2:	//180
			for(var i=0; i<this.x.length; i++){
				this.x[i] = -1*this.x[i]-1;
				this.y[i] = -1*this.y[i]-1;
			}
			newAbsOrigin = [-1*oldAbsOrigin[0]-1, -1*oldAbsOrigin[1]-1];
			this.offset = [-1*this.offset[1]-this.size[1], -1*this.offset[0]-this.size[0]];
			break;
		case 1:	//90
			for(var i=0; i<this.x.length; i++){
				var oldX = this.x[i];
				this.x[i] = -1*this.y[i]-1;
				this.y[i] = oldX;
			}
			newAbsOrigin = [-1*oldAbsOrigin[1]-1, oldAbsOrigin[0]];
			this.offset = [-1*this.offset[1]-this.size[1], this.offset[0]];
			this.size = [this.size[1], this.size[0]];
			break;
		case 3:	//270
			for(var i=0; i<this.x.length; i++){
				var oldX = this.x[i];
				this.x[i] = this.y[i];
				this.y[i] = -1*oldX;
			}
			newAbsOrigin = [oldAbsOrigin[1], -1*oldAbsOrigin[0]-1];
			this.offset = [this.offset[1], -1*this.offset[0]-this.size[0]];
			this.size = [this.size[1], this.size[0]];
			break;
		}
		//Align new absolute origin back to original absolute origin, thus translating the shape
		var transVec = [newAbsOrigin[0]-oldAbsOrigin[0], newAbsOrigin[1]-oldAbsOrigin[1]];	//Translation vector for shape origin
		for(var i=0; i<this.x.length; i++){
			this.x[i] -= transVec[0];
			this.y[i] -= transVec[1];
		}
		this.origin = [newAbsOrigin[0]-this.offset[0], newAbsOrigin[1]-this.offset[1]];	//Shift shape's defined origin to be relative to shape's real origin
		this.offset[0] -= transVec[0];
		this.offset[1] -= transVec[1];
		var oldOffset = [this.offset[0], this.offset[1]];
		var oldOrigin = [this.origin[0], this.origin[1]];
		this.normalize();
		this.offset = oldOffset;
		this.origin = oldOrigin;
		return this;
};

//Reflect a shape about shape origin's x/y axes
Shape.prototype.reflect = function(type){
	var oldAbsOrigin = [this.offset[0]+this.origin[0], this.offset[1]+this.origin[1]];
	var newAbsOrigin = [oldAbsOrigin[0], oldAbsOrigin[1]];
	switch(type){
		case 'x':
			for(var i=0; i<this.x.length; i++){
				this.y[i] *= -1;
			}
			newAbsOrigin[1] *= -1;
			break;
		case 'y':
			for(var i=0; i<this.x.length; i++){
				this.x[i] *= -1;
			}
			newAbsOrigin[0] *= -1;
			break;
		default:
			return;
	}
	var transVec = [newAbsOrigin[0]-oldAbsOrigin[0], newAbsOrigin[1]-oldAbsOrigin[1]];
	this.offset[0] -= transVec[0];
	this.offset[1] -= transVec[1];
	//Translate to [0,0] but preserve offset
	var oldOffset = [this.offset[0],this.offset[1]];
	this.normalize();
	this.offset = oldOffset;
	this.origin = [newAbsOrigin[0]-this.offset[0], newAbsOrigin[1]-this.offset[1]];
	return this;
}

//TODO: optimize
//Translate to quadrant 1, remove duplicate coordinates
Shape.prototype.normalize = function(){
	//Remove duplicates - "Set" is not standardized yet...there's probably a faster way to do this
	var remove = [];
	for(var i=0; i<this.x.length; i++){
		if(remove.indexOf(i) == -1){	//Ignore removed elements...this can be faster with binary search
			for(var j=i+1; j<this.x.length; j++){
				if(this.x[i] == this.x[j] && this.y[i] == this.y[j]){
					remove[remove.length] == j;
				}
			}
		}
	}
	//Splice out duplicate elements...this could be faster
	for(var i=0; i<remove.length; i++){
		this.x.splice(remove[i],1);
	}
	
	//Find the gap between [0,0] and top left of bounding rectangle
	var xMin = Math.min();	//wtf
	var yMin = Math.min();
	for(var i=0; i<this.x.length; i++){
		xMin = Math.min(xMin, this.x[i]);
		yMin = Math.min(yMin, this.y[i]);
	}
	//Translate to [0,0]
	for(var i=0; i<this.x.length; i++){
		this.x[i] = this.x[i]-xMin;
		this.y[i] = this.y[i]-yMin;
	}
	//Modify offset and origin to compensate for translation
	this.offset[0] += xMin;
	this.offset[1] += yMin;
	this.origin[0] -= xMin;
	this.origin[1] -= yMin;
	this.size = this.calculateSize();	//is this necessary?
	return this;	
};

//Merge a shape or array of shapes into current shape
Shape.prototype.merge = function(shapes){
	//Translate to real position using offset
	for(var i=0; i<this.x.length; i++){
		this.x[i] = this.x[i]+this.offset[0];
		this.y[i] = this.y[i]+this.offset[1];
	}
	this.offset = [0,0];
	//Merge each shape into this one
	if(!(shapes instanceof Array)){
		shapes = [shapes];
	}
	for(var k=0; k<shapes.length; k++){
		var shape = shapes[k];
		for(var i=0; i<shape.x.length; i++){
			this.x[this.x.length] = shape.x[i]+shape.offset[0];
			this.y[this.y.length] = shape.y[i]+shape.offset[1];
		}
	}
	//Normalize to translate to [0,0] and recalculate offset, origin, and size
	this.normalize();
	this.origin = [Math.floor(this.size[0]/2), Math.floor(this.size[1]/2)];
	return this;
};

//Return a deep copy of current shape
Shape.prototype.copy = function(){
	var newX = [];
	var newY = [];
	for(var i=0; i<this.x.length; i++){
		newX[i] = this.x[i];
		newY[i] = this.y[i];
	}
	var newOffset = [this.offset[0], this.offset[1]];
	var newOrigin = [this.origin[0], this.origin[1]];
	return new Shape(newX, newY, newOrigin, newOffset);
};

//TODO: redo and optimize this, possibly by sorting coordinate lists in normalize()?
//Checks whether this shape is equivalent to another shape
Shape.prototype.equals = function(shape){
	//naive method: O(n^2) comparison of both lists, assuming no duplicates
	if(this.x.length != shape.x.length || this.offset[0] != shape.offset[0] || this.offset[1] != shape.offset[1] || this.origin[0] != shape.origin[0] || this.origin[1] != shape.origin[1]){
		return false;
	}
	for(var i=0; i<this.x.length; i++){
		var found = false;
		for(var j=0; j<this.x.length; j++){
			if(this.x[i] == shape.x[j] && this.y[i] == shape.y[j]){
				found = true;
				break;
			}
		}
		if(!found){
			return false;
		}
	}
	return true;
};

//===============================================================================================================================================

function BinShape(binArr, size, origin, offset){
	this.binArr = binArr;
	this.size = size;
	this.offset = (typeof offset == "undefined" ? [0,0] : offset);
	this.origin = origin;
	this.normalize();
};

//Get value at x,y
BinShape.prototype.get = function(col, row){
	return this.binArr[row*this.size[0]+col];
};


//Return this shape as a Shape object (sparse coordinate array representation)
BinShape.prototype.toShape = function(){
	var x = [];
	var y = [];
	for(var i=0; i<this.size[0]; i++){
		for(var j=0; j<this.size[1]; j++){
			if(this.get(i,j) == 1){
				x[x.length] = i;
				y[y.length] = j;
			}
		}
	}
	return new Shape(x,y,[this.origin[0], this.origin[1]],[this.offset[0],this.offset[1]]);
};

//Calculate whether shape intersects another shape
BinShape.prototype.intersects = function(shape){
	//Shape bounds do not intersect at all
	if(this.offset[0] >= shape.offset[0]+shape.size[0] || this.offset[0]+this.size[0]<=shape.offset[0] || this.offset[1] >= shape.offset[1]+shape.size[1] || this.offset[1]+this.size[1]<=shape.offset[1]){
		return false;
	}
	
	//Shape bounds intersect; calculate intersection rectangle coordinates, then use to determine if shapes intersect
	var intersectX1 = Math.max(this.offset[0],shape.offset[0]);
	var intersectY1 = Math.max(this.offset[1],shape.offset[1]);
	var intersectX2 = Math.min(this.offset[0]+this.size[0],shape.offset[0]+shape.size[0]);
	var intersectY2 = Math.min(this.offset[1]+this.size[1],shape.offset[1]+shape.size[1]);
	for(var i=intersectX1; i<intersectX2; i++){
		for(var j=intersectY1; j<intersectY2; j++){
			if(this.get(i-this.offset[0],j-this.offset[1]) && shape.get(i-shape.offset[0],j-shape.offset[1])){
				return true;
			}
		}
	}
	return false;
};

//Rotate shape clockwise n times
BinShape.prototype.rotate = function(n){
	var oldAbsOrigin = [this.offset[0]+this.origin[0], this.offset[1]+this.origin[1]];
	var newAbsOrigin;
	n%=4;
	var newOffset = [this.offset[0], this.offset[1]];
	switch(n){
		case 0:
			return this;
		case 2:
			this.binArr.reverse();	//this may be slower than using a xor swap reverse
			newAbsOrigin = [-1*oldAbsOrigin[0]-1, -1*oldAbsOrigin[1]-1];
			break;
		case 1:
		case 3:
			var newBinArr = [];
			for(var i=0; i<this.size[0]; i++){
				for(var j=this.size[1]-1; j>=0; j--){
					newBinArr[newBinArr.length] = this.get(i,j);	//faster than push() except negligbly on Chrome?  maybe try instantiate+assign instead of empty+append
				}
			}
			if(n==1){
				newAbsOrigin = [-1*oldAbsOrigin[1]-1, oldAbsOrigin[0]];
			}else{
				newAbsOrigin = [oldAbsOrigin[1], -1*oldAbsOrigin[0]-1];
				newBinArr.reverse();	//xor swap?
			}
			this.binArr = newBinArr;
			this.size = [this.size[1],this.size[0]];
			break;
	}
	var transVec = [newAbsOrigin[0]-oldAbsOrigin[0], newAbsOrigin[1]-oldAbsOrigin[1]];
	this.offset[0] -= transVec[0];
	this.offset[1] -= transVec[1];
	this.origin = [newAbsOrigin[0]-this.offset[0], newAbsOrigin[1]-this.offset[1]];
	return this;
};

//Reflect a shape about x/y axis; offset does not change
BinShape.prototype.reflect = function(type){
	var newBinArr = [];
	var oldAbsOrigin = [this.offset[0]+this.origin[0], this.offset[1]+this.origin[1]];
	var newAbsOrigin = [oldAbsOrigin[0], oldAbsOrigin[1]];
	switch(type){
		case 'x':
			for(var j=this.size[1]-1; j>=0; j--){
				for(var i=0; i<this.size[0]; i++){
					newBinArr[newBinArr.length] = this.get(i,j);
				}
			}
			newAbsOrigin[1] *= -1;
			break;
		case 'y':
			for(var j=0; j<this.size[1]; j++){
				for(var i=this.size[0]-1; i>=0; i--){
					newBinArr[newBinArr.length] = this.get(i,j);
				}
			}
			newAbsOrigin[0] *= -1;
			break;
		default:
			return;
	}
	this.binArr = newBinArr;
	var transVec = [newAbsOrigin[0]-oldAbsOrigin[0], newAbsOrigin[1]-oldAbsOrigin[1]];
	this.offset[0] -= transVec[0];
	this.offset[1] -= transVec[1];
	this.origin = [newAbsOrigin[0]-this.offset[0], newAbsOrigin[1]-this.offset[1]];
	return this;
};

//Trim shape and translate to [0,0]
//TODO: Optimize?
BinShape.prototype.normalize = function(){
	//Build a row and column histogram
	var histCols = initArray(this.size[0], 0);
	var histRows = initArray(this.size[1], 0);
	for(var i=0; i<this.binArr.length; i++){
		if(this.binArr[i]){
			histCols[i%this.size[0]]++;
			histRows[Math.floor(i/this.size[0])]++;
		}
	}
	//Sweep histograms 4 times to find the minimal shape
	var xMin;
	var xMax = this.size[0];
	var yMin = 0;
	var yMax = this.size[1];
	for(xMin=0; xMin<this.size[0]; xMin++){
		if (histCols[xMin] > 0){
			break;
		}
	}
	for(xMax=this.size[0]-1; xMax>=0; xMax--){
		if (histCols[xMax] > 0){
			break;
		}
	}
	for(yMin=0; yMin<this.size[1]; yMin++){
		if (histRows[yMin] > 0){
			break;
		}
	}
	for(yMax=this.size[1]-1; yMax>=0; yMax--){
		if (histRows[yMax] > 0){
			break;
		}
	}
	//Copy the submatrix to a binary array
	var newSize = [xMax-xMin+1,yMax-yMin+1];
	var newBinArr = initArray(newSize[0]*newSize[1], 0);
	for(var i=xMin; i<=xMax; i++){
		for(var j=yMin; j<=yMax; j++){
			newBinArr[(j-yMin)*newSize[0]+(i-xMin)] = this.get(i,j);
		}
	}
	this.size = newSize;
	this.binArr = newBinArr;
	//Modify offset to compensate for translation
	this.offset[0] += xMin;
	this.offset[1] += yMin;
	this.origin[0] -= xMin;
	this.origin[1] -= yMin;
	return this;
};

//Merge any number of shapes into current shape
//TODO: optimization
BinShape.prototype.merge = function(shapes){
	if(!(shapes instanceof Array)){
		shapes = [shapes];
	}
	//Calculate max and min offsets so we can extend the shape as needed
	var offsetMin = [0,0];
	var offsetMax = [0,0];
	shapes[shapes.length] = this;	//Add current shape to shape array so we can add them all in batch
	for(var k=0; k<shapes.length; k++){
		var shape = shapes[k];
		for(var n=0; n<2; n++){
			if(shape.offset[n] < offsetMin[n]){
				offsetMin[n] = shape.offset[n];
			}
			if (shape.size[n]+shape.offset[n] > offsetMax[n]){
				offsetMax[n] = shape.size[n]+shape.offset[n];
			}
		}
	}
	var newSize = [offsetMax[0]-offsetMin[0], offsetMax[1]-offsetMin[1]];
	var newBinArr = initArray(newSize[0]*newSize[1],0);
	//Copy all shape coordinates (offset applied) into new array
	for(var k=0; k<shapes.length; k++){
		var shape = shapes[k];
		for(var i=0; i<shape.size[0]; i++){
			for(var j=0; j<shape.size[1]; j++){
				var newPos = [i-offsetMin[0]+shape.offset[0], j-offsetMin[1]+shape.offset[1]];
				var newIdx = newPos[1]*newSize[0]+newPos[0];
				newBinArr[newIdx] |= shape.get(i,j);
			}
		}
	}
	this.binArr = newBinArr;
	this.size = newSize;
	this.offset = [0,0];
	this.normalize();
	this.origin = [Math.floor(this.size[0]/2), Math.floor(this.size[1]/2)];
	return this;
};

//Return a deep copy of current shape
BinShape.prototype.copy = function(){
	var newBinArr = [];
	for(var i=0; i<this.binArr.length; i++){
		newBinArr[i] = this.binArr[i];
	}
	var newSize = [this.size[0], this.size[1]];
	var newOffset = [this.offset[0], this.offset[1]];
	var newOrigin = [this.origin[0], this.origin[1]];
	return new BinShape(newBinArr, newSize, newOrigin, newOffset);
};

//Check if this shape is identical to another shape (assuming both are normalized)
BinShape.prototype.equals = function(shape){
	if(this.offset[0] != shape.offset[0] || this.offset[1] != shape.offset[1] || this.size[0] != shape.size[0] || this.size[1] != shape.size[1] || this.origin[0] != shape.origin[0] || this.origin[1] != shape.origin[1]){
		return false;
	}
	for(var i=0; i<this.binArr.length; i++){
		if(this.binArr[i] != shape.binArr[i]){
			return false;
		}
	}
	return true;
};

//Maximum size subsquare of 1s in rectangular matrix
//Returns [sqrt, x, y], where sqrt is the length of the side of the largest square, and (x,y) is the top left corner of the square (inclusive)
BinShape.prototype.maxSquare = function(){
	var maxSquare = [0,0,0];	//val,x,y
	//Keep track of two rows at a time
	var upVals = initArray(this.size[0],0);
	var lastVal = 0;
	//Traverse row by row, where val[i,j] = 1+min(val[i-1,j-1], val[i-1,j], val[i,j-1]) if the matrix value is 1; else val[i,j]=0
	for(var j=0; j<this.size[1]; j++){
		for(var i=0; i<this.size[0]; i++){
			if(this.get(i,j) == 1){
				var up = upVals[i];
				var left = (i == 0) ? 0 : lastVal;
				var diag = (i == 0) ? 0 : upVals[i-1];
				var val = 1 + Math.min(up,left,diag);
				if(val > maxSquare[0]){
					maxSquare[0] = val;
					maxSquare[1] = i;
					maxSquare[2] = j;
				}
				if(i != 0){
					upVals[i-1] = lastVal;
				}
				lastVal = val;
			} else {
				if(i != 0){
					upVals[i-1] = lastVal;
				}
				lastVal = 0;
			}
		}
		lastVal = 0;
	}
	//Shift the indices to the topleft of the submatrix before return
	maxSquare[1] = maxSquare[1] - maxSquare[0] + 1;
	maxSquare[2] = maxSquare[2] - maxSquare[0] + 1;
	return maxSquare;
};
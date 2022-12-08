import { Vector2 } from 'three';

class SelectionHelper {

	constructor( renderer, cssClassName ) {

		this.element = document.createElement( 'div' );
		this.element.classList.add( cssClassName );
		this.element.style.pointerEvents = 'none';

		this.renderer = renderer;

		this.startPoint = new Vector2();
		this.pointTopLeft = new Vector2();
		this.pointBottomRight = new Vector2();

		this.isDown = false;

		this.onPointerDown = function ( x, y ) {

			this.isDown = true;
			this.onSelectStart( x, y );

		}.bind( this );

		this.onPointerMove = function ( x, y ) {

			if ( this.isDown ) {

				this.onSelectMove( x, y );

			}

		}.bind( this );

		this.onPointerUp = function ( ) {

			this.isDown = false;
			this.onSelectOver();

		}.bind( this );

	}

	dispose() {
		if (this.isDown){
			
		this.onSelectOver();

		}
		this.isDown = false;
	}


	onSelectStart( x , y ) {

		this.element.style.display = 'none';

		this.renderer.domElement.parentElement.appendChild( this.element );

		this.element.style.left = x+ 'px';
		this.element.style.top = y + 'px';
		this.element.style.width = '0px';
		this.element.style.height = '0px';

		this.startPoint.x =	x;
		this.startPoint.y = y;

	}

	onSelectMove( x, y ) {
		this.element.style.display = 'block';

		this.pointBottomRight.x = Math.max( this.startPoint.x, x );
		this.pointBottomRight.y = Math.max( this.startPoint.y, y );
		this.pointTopLeft.x = Math.min( this.startPoint.x, x );
		this.pointTopLeft.y = Math.min( this.startPoint.y, y );

		this.element.style.left = this.pointTopLeft.x + 'px';
		this.element.style.top = this.pointTopLeft.y + 'px';
		this.element.style.width = ( this.pointBottomRight.x - this.pointTopLeft.x ) + 'px';
		this.element.style.height = ( this.pointBottomRight.y - this.pointTopLeft.y ) + 'px';

	}

	onSelectOver() {
		this.element.parentElement.removeChild( this.element );

	}

}

export { SelectionHelper };

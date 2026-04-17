/**
 * We2Goo — Main Frontend Script
 * Maneja: filtro de origen, FAQ accordion, live badge counter.
 *
 * Vanilla JS puro — sin jQuery, sin dependencias externas.
 * Compatible con Chrome 80+, Safari 13+, Firefox 75+.
 *
 * @package We2Goo_Child
 * @version 1.0.0
 */

( function () {
	'use strict';

	/* ─────────────────────────────────────────────────────────
	   1. HELPER — DOM ready
	   ───────────────────────────────────────────────────────── */
	function ready( fn ) {
		if ( document.readyState !== 'loading' ) {
			fn();
		} else {
			document.addEventListener( 'DOMContentLoaded', fn );
		}
	}

	/* ─────────────────────────────────────────────────────────
	   2. FAQ ACCORDION
	   Activa los botones .w2g-faq__question y gestiona
	   aria-expanded + clase is-open en el panel.
	   ───────────────────────────────────────────────────────── */
	function initFaqAccordion() {
		const faqs = document.querySelectorAll( '.w2g-faq__question' );
		if ( ! faqs.length ) return;

		faqs.forEach( function ( btn ) {
			btn.addEventListener( 'click', function () {
				const expanded = this.getAttribute( 'aria-expanded' ) === 'true';
				const panelId  = this.getAttribute( 'aria-controls' );
				const panel    = document.getElementById( panelId );

				if ( ! panel ) return;

				// Cerrar todos los demás en el mismo contenedor
				const container = this.closest( '.w2g-faq' );
				if ( container ) {
					container.querySelectorAll( '.w2g-faq__question' ).forEach( function ( otherBtn ) {
						if ( otherBtn !== btn ) {
							otherBtn.setAttribute( 'aria-expanded', 'false' );
							const otherId    = otherBtn.getAttribute( 'aria-controls' );
							const otherPanel = document.getElementById( otherId );
							if ( otherPanel ) otherPanel.classList.remove( 'is-open' );
						}
					} );
				}

				// Toggle este ítem
				this.setAttribute( 'aria-expanded', String( ! expanded ) );
				panel.classList.toggle( 'is-open', ! expanded );
			} );
		} );
	}

	/* ─────────────────────────────────────────────────────────
	   3. FILTRO DE ORIGEN EN /OFERTAS/
	   Lee data-origin de cada botón y filtra las cards que
	   tienen data-origins="BCN,MAD,..." en el DOM.
	   Persiste selección en sessionStorage.
	   ───────────────────────────────────────────────────────── */
	function initOriginFilter() {
		const filterBtns = document.querySelectorAll( '.w2g-origin-filter__btn' );
		if ( ! filterBtns.length ) return;

		// Restaurar selección previa
		const savedOrigin = sessionStorage.getItem( 'w2g_origin_filter' ) || 'all';

		filterBtns.forEach( function ( btn ) {
			const origin = btn.getAttribute( 'data-origin' );
			if ( origin === savedOrigin ) {
				btn.setAttribute( 'aria-pressed', 'true' );
			} else {
				btn.setAttribute( 'aria-pressed', 'false' );
			}

			btn.addEventListener( 'click', function () {
				const selected = this.getAttribute( 'data-origin' );

				// Actualizar estado de botones
				filterBtns.forEach( function ( b ) {
					b.setAttribute( 'aria-pressed', b.getAttribute( 'data-origin' ) === selected ? 'true' : 'false' );
				} );

				// Persistir
				sessionStorage.setItem( 'w2g_origin_filter', selected );

				// Filtrar cards
				filterCards( selected );
			} );
		} );

		// Aplicar filtro inicial
		filterCards( savedOrigin );
	}

	/**
	 * Filtra las .w2g-offer-card según el IATA de origen seleccionado.
	 * Las cards deben tener el atributo data-origins="BCN,MAD,BOG".
	 *
	 * @param {string} origin - IATA de ciudad de origen o 'all'.
	 */
	function filterCards( origin ) {
		const cards = document.querySelectorAll( '[data-origins]' );
		if ( ! cards.length ) return;

		var hiddenCount = 0;

		cards.forEach( function ( card ) {
			if ( origin === 'all' ) {
				card.style.display = '';
				card.removeAttribute( 'aria-hidden' );
			} else {
				const origins    = card.getAttribute( 'data-origins' ) || '';
				const originsArr = origins.split( ',' ).map( function ( s ) { return s.trim(); } );
				const matches    = originsArr.includes( origin );

				card.style.display    = matches ? '' : 'none';
				card.setAttribute( 'aria-hidden', matches ? 'false' : 'true' );

				if ( ! matches ) hiddenCount++;
			}
		} );

		// Mostrar mensaje si no hay resultados
		const noResults = document.getElementById( 'w2g-no-results' );
		if ( noResults ) {
			noResults.hidden = ( hiddenCount < cards.length );
		}
	}

	/* ─────────────────────────────────────────────────────────
	   4. SKIP LINK — asegurar visibilidad al focus
	   (por si el CSS del tema lo sobreescribe)
	   ───────────────────────────────────────────────────────── */
	function initSkipLink() {
		const skip = document.querySelector( '.skip-link' );
		if ( ! skip ) return;
		// Nada que hacer — manejado por CSS :focus, pero asegurar que
		// el elemento exista en el DOM (lo inserta el tema si no está)
	}

	/* ─────────────────────────────────────────────────────────
	   5. BRAND NAME CONSISTENCY — "We2 Goo" → "We2Goo"
	   Recorre el DOM y corrige el nombre si el tema lo renderiza
	   con espacio. (Temporal hasta arreglar fuente en settings)
	   ───────────────────────────────────────────────────────── */
	function fixBrandName() {
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
			null,
			false
		);

		const textNodes = [];
		let node;
		while ( ( node = walker.nextNode() ) ) {
			if ( node.nodeValue && node.nodeValue.includes( 'We2 Goo' ) ) {
				textNodes.push( node );
			}
		}

		textNodes.forEach( function ( tn ) {
			tn.nodeValue = tn.nodeValue.replace( /We2 Goo/g, 'We2Goo' );
		} );
	}

	/* ─────────────────────────────────────────────────────────
	   6. INIT
	   ───────────────────────────────────────────────────────── */
	ready( function () {
		initFaqAccordion();
		initOriginFilter();
		initSkipLink();
		fixBrandName();
	} );

} )();

import { LightningElement, api } from 'lwc';

const FALLBACK_IMAGE = 'https://placehold.co/400x200/e8e8e8/666?text=No+Image';

const CATEGORY_COLORS = {
    Tractor: 'slds-badge slds-badge_lightest category-tractor',
    Combine: 'slds-badge slds-badge_lightest category-combine',
    Implement: 'slds-badge slds-badge_lightest category-implement',
    Attachment: 'slds-badge slds-badge_lightest category-attachment'
};

export default class AuctionListingCard extends LightningElement {
    @api listing;
    @api selected = false;

    handleClick() {
        if (!this.listing) return;
        this.dispatchEvent(new CustomEvent('listingselect', {
            detail: { listingId: this.listing.id }
        }));
    }

    handleImageError(event) {
        event.target.src = FALLBACK_IMAGE;
    }

    get imageUrl() {
        return this.listing && this.listing.imageUrl ? this.listing.imageUrl : FALLBACK_IMAGE;
    }

    get currentBidDisplay() {
        if (!this.listing) return '';
        const amount = this.listing.currentBid || this.listing.startingPrice;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }

    get cardClass() {
        const classes = ['listing-card', 'slds-radius_medium'];
        if (this.listing && this.listing.status === 'Closed') {
            classes.push('listing-card_closed');
        }
        if (this.selected) {
            classes.push('listing-card_selected');
        }
        return classes.join(' ');
    }

    get categoryBadgeClass() {
        return this.listing ? CATEGORY_COLORS[this.listing.category] || 'slds-badge' : 'slds-badge';
    }

    get statusBadgeClass() {
        return this.listing && this.listing.status === 'Active'
            ? 'slds-badge slds-badge_success'
            : 'slds-badge';
    }
}
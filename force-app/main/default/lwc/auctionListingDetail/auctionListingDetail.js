import { LightningElement, api, track } from 'lwc';
import getListing from '@salesforce/apex/AuctionListingController.getListing';
import getBidHistory from '@salesforce/apex/BidController.getBidHistory';
import { subscribe, unsubscribe } from 'lightning/empApi';

const FALLBACK_IMAGE = 'https://placehold.co/800x400/e8e8e8/666?text=No+Image';
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default class AuctionListingDetail extends LightningElement {
    _listingId;

    @api
    get listingId() {
        return this._listingId;
    }
    set listingId(value) {
        if (this._listingId === value) {
            return;
        }
        this._listingId = value;
        this.listing = null;
        this.bids = [];
        if (this.isConnected && value) {
            this.loadData();
        }
    }

    @track listing = null;
    @track bids = [];
    @track isLoading = false;

    _subscription = null;

    connectedCallback() {
        if (this.listingId) {
            this.loadData();
        }
        subscribe('/event/Bid_Placed__e', -1, (event) => {
            if (event.data.payload.Listing_Id__c === this.listingId) {
                this.loadData();
            }
        }).then(sub => {
            this._subscription = sub;
        });
    }

    @api
    refresh() {
        if (this.listingId) {
            this.loadData();
        }
    }

    disconnectedCallback() {
        if (this._subscription) {
            unsubscribe(this._subscription, () => {});
        }
    }

    loadData() {
        const requestedListingId = this.listingId;
        if (!requestedListingId) {
            return;
        }

        this.isLoading = true;
        Promise.all([
            getListing({ listingId: requestedListingId }),
            getBidHistory({ listingId: requestedListingId })
        ])
            .then(([listing, bidHistory]) => {
                if (this.listingId !== requestedListingId) {
                    return;
                }
                this.listing = listing;
                this.bids = bidHistory.map(bid => ({
                    ...bid,
                    amountDisplay: currencyFormatter.format(bid.amount),
                    formattedBidTime: bid.bidTime ? new Date(bid.bidTime).toLocaleString() : '',
                    rowClass: bid.isHighest ? 'bid-row bid-row_highest' : 'bid-row'
                }));
                this.isLoading = false;
            })
            .catch(error => {
                if (this.listingId !== requestedListingId) {
                    return;
                }
                console.error('Error loading listing:', error);
                this.isLoading = false;
            });
    }

    handleBidSuccess() {
        this.loadData();
        this.dispatchEvent(new CustomEvent('bidsuccess'));
    }

    handleImageError(event) {
        event.target.src = FALLBACK_IMAGE;
    }

    get imageUrl() {
        return this.listing && this.listing.imageUrl ? this.listing.imageUrl : FALLBACK_IMAGE;
    }

    get isActive() {
        return this.listing && this.listing.status === 'Active';
    }

    get startingPriceDisplay() {
        return this.listing
            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.listing.startingPrice)
            : '';
    }

    get currentBidDisplay() {
        if (!this.listing) return '';
        const amount = this.listing.currentBid || this.listing.startingPrice;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }

    get formattedEndsAt() {
        if (!this.listing || !this.listing.endsAt) return '';
        return new Date(this.listing.endsAt).toLocaleString();
    }

    get categoryBadgeClass() {
        if (!this.listing) return 'slds-badge';
        const colors = {
            Tractor: 'slds-badge slds-badge_lightest category-tractor',
            Combine: 'slds-badge slds-badge_lightest category-combine',
            Implement: 'slds-badge slds-badge_lightest category-implement',
            Attachment: 'slds-badge slds-badge_lightest category-attachment'
        };
        return colors[this.listing.category] || 'slds-badge';
    }

    get statusBadgeClass() {
        if (!this.listing) return 'slds-badge';
        return this.listing.status === 'Active' ? 'slds-badge slds-badge_success' : 'slds-badge';
    }

    get hasBids() {
        return this.bids.length > 0;
    }
}
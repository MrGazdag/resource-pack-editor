export default interface RPECancellableEvent {
    isCancelled(): boolean;
    setCancelled(cancelled: boolean): void;
}
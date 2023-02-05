export default abstract class RPEPlatform {
    private readonly id: string;
    private readonly name: string;
    protected constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
    public getID() {
        return this.id;
    }
    public getName() {
        return this.name;
    }
    public abstract onload(): void;
}
import DataSizes from "./DataSizes";

/**
 * A class that goes through a {@link DataView}.
 * It has a built in index, that increments after every read.
 * This is useful to pass to other objects without having to
 * keep track of changing the offsets.
 */
export default class DataViewReader {
    /**
     * The {@link DataView} that is being read.
     */
    _dv: DataView;
    /**
     * The current offset into the {@link DataView}.
     */
    _offset: number;
    /**
     * A TextDecoder instance, which is lazily instantiated.
     */
    _textDecoder: TextDecoder | null;
    /**
     * Creates a new DataViewReader from a DataView.
     * You can optionally specify an offset to start at.
     * 
     * @param dataView the dataview to write to
     * @param offset the offset to start at
     */
    constructor(dataView: DataView, offset: number=0) {
        this._dv = dataView;
        this._offset = offset;
    }
    /**
     * Reads an unsigned 8-bit integer.
     * In Java this is commonly known as a `byte`.
     * @returns the read number
     */
    readUint8(): number {
        let result = this._dv.getUint8(this._offset);
        this._offset += DataSizes.UINT8;
        return result;
    }
    /**
     * Reads an unsigned 16-bit integer.
     * In Java this is commonly known as a `short`.
     * @returns the read number
     */
    readUint16(): number {
        let result = this._dv.getUint16(this._offset);
        this._offset += DataSizes.UINT16;
        return result;
    }
    /**
     * Reads an unsigned 32-bit integer.
     * In Java this is commonly known as an `int`.
     * @returns the read number
     */
    readUint32(): number {
        let result = this._dv.getUint32(this._offset);
        this._offset += DataSizes.UINT32;
        return result;
    }
    /**
     * Reads a signed 8-bit integer.
     * In Java this is commonly known as a `byte`.
     * @returns the read number
     */
    readInt8(): number {
        let result = this._dv.getInt8(this._offset);
        this._offset += DataSizes.INT8;
        return result;
    }
    /**
     * Reads a signed 16-bit integer.
     * In Java this is commonly known as a `short`.
     * @returns the read number
     */
    readInt16(): number {
        let result = this._dv.getInt16(this._offset);
        this._offset += DataSizes.INT16;
        return result;
    }
    /**
     * Reads a signed 32-bit integer.
     * In Java this is commonly known as an `int`.
     * @returns the read number
     */
    readInt32(): number {
        let result = this._dv.getInt32(this._offset);
        this._offset += DataSizes.INT32;
        return result;
    }
    /**
     * Reads a 32-bit floating point number.
     * In Java this is commonly known as a `float`.
     * @returns the read number
     */
    readFloat(): number {
        let result = this._dv.getFloat32(this._offset);
        this._offset += DataSizes.FLOAT;
        return result;
    }
    /**
     * Reads a 64-bit floating point number.
     * In Java this is commonly known as a `double`.
     * @returns the read number
     */
    readDouble(): number {
        let result = this._dv.getFloat64(this._offset);
        this._offset += DataSizes.DOUBLE;
        return result;
    }
    /*
    /**
     * Reads a signed 64-bit integer.
     * In Java this is commonly known as a `long`.
     * @returns the read number
     * /
    readInt64(): bigint {
        let result = this._dv.getBigInt64(this._offset);
        this._offset += DataSizes.INT64;
        return result;
    }
    /**
     * Reads an unsigned 64-bit integer.
     * In Java this is commonly known as a `long`.
     * @returns the read number
     * /
    readUint64(): bigint {
        let result = this._dv.getBigUint64(this._offset);
        this._offset += DataSizes.UINT64;
        return result;
    }
    */
    /**
     * Reads an UTF-16BE encoded string with the specified length.
     * If the length is 0, then `null` will be returned.
     * 
     * @param length the length of the string to read (in characters)
     * @returns the read string or `null` if the `length` is 0
     */
    readUTF16BEString(length: number): string | null {
        if (length == 0) return null;
        let array = new Uint16Array(length);
        for (let charIndex = 0; charIndex < length; charIndex++) {
            array[charIndex] = this._dv.getUint16(this._offset + 2 * charIndex);
        }
        this._offset += DataSizes.UINT16 * length;

        // Actual UTF-16BE conversion
        return String.fromCharCode.apply(null, array);
    }
    /**
     * Reads an UTF-8 encoded string with the specified length.
     * If the length is 0, then `null` will be returned.
     * 
     * @param length the length of the string to read (in characters)
     * @returns the read string or `null` if the `length` is 0
     */
    readUTF8String(length: number): string | null {
        if (length == 0) return null;

        if (this._textDecoder == null) {
            this._textDecoder = new TextDecoder();
        }
        let result = this._textDecoder.decode(this._dv.buffer.slice(this._offset, this._offset+(length*DataSizes.UINT8)));
        this._offset += DataSizes.UINT8 * length;
        return result;
    }
    /**
     * Skips the specified number of bytes. The offset of this
     * DataViewReader will be incremented (or decremented if negative) by `amount`.
     * @param amount the amount of bytes to skip
     */
    skip(amount: number) {
        this._offset += amount;
    }
    /**
     * Returns the current offset of this DataViewReader.
     * @returns the current offset (in bytes)
     */
    getOffset(): number {
        return this._offset;
    }
    /**
     * Sets the current offset of this DataViewReader to the specified value.
     * @param offset the new offset (in bytes)
     */
    setOffset(offset: number) {
        this._offset = offset;
    }

    hasMore() {
        return this._offset == this._dv.byteLength;
    }
}
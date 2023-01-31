import DataSizes from "./DataSizes";

/**
 * A class that is used for writing into a {@link DataView}.
 * It has a built in index, that increments after every write.
 * This is useful to pass to other objects without having to
 * keep track of changing the offsets.
 */
export default class DataViewWriter {
    /**
     * The {@link DataView} that is being written to.
     */
     _dv: DataView;
     /**
      * The current offset into the {@link DataView}.
      */
     _offset: number;
     /**
      * A TextEncoder instance, which is lazily instantiated.
      */
     _textEncoder: TextEncoder | null;
     /**
      * Creates a new DataViewWriter from a DataView.
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
     * Writes the specified value as an unsigned 8-bit integer.
     * In Java this is commonly known as a `byte`.
     * @param value the value to write
     */
    writeUint8(value: number) {
        this._dv.setUint8(this._offset, value);
        this._offset += DataSizes.UINT8;
    }
    /**
     * Writes the specified value as an unsigned 16-bit integer.
     * In Java this is commonly known as a `short`.
     * @param value the value to write
     */
    writeUint16(value: number) {
        this._dv.setUint16(this._offset, value);
        this._offset += DataSizes.UINT16;
    }
    /**
     * Writes the specified value as an unsigned 32-bit integer.
     * In Java this is commonly known as an `int`.
     * @param value the value to write
     */
    writeUint32(value: number) {
        this._dv.setUint32(this._offset, value);
        this._offset += DataSizes.UINT32;
    }
    /**
     * Writes the specified value as a signed 8-bit integer.
     * In Java this is commonly known as a `byte`.
     * @param value the value to write
     */
    writeInt8(value: number) {
        this._dv.setInt8(this._offset, value);
        this._offset += DataSizes.INT8;
    }
    /**
     * Writes the specified value as a signed 16-bit integer.
     * In Java this is commonly known as a `short`.
     * @param value the value to write
     */
    writeInt16(value: number) {
        this._dv.setInt16(this._offset, value);
        this._offset += DataSizes.INT16;
    }
    /**
     * Writes the specified value as a signed 32-bit integer.
     * In Java this is commonly known as an `int`.
     * @param value the value to write
     */
    writeInt32(value: number) {
        this._dv.setInt32(this._offset, value);
        this._offset += DataSizes.INT32;
    }
    /**
     * Writes the specified value as a 32-bit floating point integer.
     * In Java this is commonly known as a `float`.
     * @param value the value to write
     */
    writeFloat(value: number) {
        this._dv.setFloat32(this._offset, value);
        this._offset += DataSizes.FLOAT;
    }
    /**
     * Writes the specified value as a 64-bit floating point integer.
     * In Java this is commonly known as a `double`.
     * @param value the value to write
     */
    writeDouble(value: number) {
        this._dv.setFloat64(this._offset, value);
        this._offset += DataSizes.DOUBLE;
    }
    /*
    /**
     * Writes the specified value as a signed 64-bit integer.
     * In Java this is commonly known as a `long`.
     * @param value the value to write
     * /
    writeInt64(value: bigint) {
        this._dv.setBigInt64(this._offset, value);
        this._offset += DataSizes.INT64;
    }
    /**
     * Writes the specified value as an unsigned 64-bit integer.
     * In Java this is commonly known as a `long`.
     * @param value the value to write
     * /
    writeUint64(value: bigint) {
        this._dv.setBigUint64(this._offset, value);
        this._offset += DataSizes.UINT64;
    }
    */
    /**
     * Writes the specified value as an UTF-16BE encoded string.
     * @param value the string to write
     */
    writeUTF16BEString(value: string) {
        for (let charIndex = 0; charIndex < value.length; charIndex++) {
            this._dv.setUint16(this._offset + 2 * charIndex, value.charCodeAt(charIndex));
        }
        this._offset += DataSizes.UINT16 * value.length;
    }
    /**
     * Writes the specified value as an UTF-8 encoded string.
     * @param value the string to write
     */
    writeUTF8String(value: string) {
        if (this._textEncoder == null) {
            this._textEncoder = new TextEncoder();
        }
        let result = this._textEncoder.encode(value);
        for (let i = 0; i < result.length; i++) {
            this._dv.setUint8(this._offset + (i * DataSizes.UINT8), result[i]);
        }
        this._offset += DataSizes.UINT8 * value.length;
    }
    /**
     * Returns the underlying DataView object that this
     * DataViewWriter writes to.
     * @returns the DataView
     */
    getView(): DataView {
        return this._dv;
    }
    /**
     * Returns the current offset of this DataViewWriter.
     * @returns the current offset (in bytes)
     */
    getOffset(): number {
        return this._offset;
    }
    /**
     * Sets the current offset of this DataViewWriter to the specified value.
     * @param offset the new offset (in bytes)
     */
    setOffset(offset: number) {
        this._offset = offset;
    }
}
export function checkMimeType(type, allowedTypes) {
    const fileType = type.toLowerCase();

    if (allowedTypes.some(m => m == '*' || m == '*/*')) {
        return true;
    }

    return allowedTypes.some((allowed) => {
        const [allowedType, allowedSubtype] = allowed.toLowerCase().split('/');
        const [fileMainType, fileSubtype] = fileType.split('/');

        return (allowedType == fileMainType || allowedType == '*')
            && (allowedSubtype == fileSubtype || allowedSubtype == '*');
    });
}

export function unsupportedFileTypeError() {
    return new Error('Unsupported file type. Convert the file to a different format or choose '
        + 'a different file.')
}

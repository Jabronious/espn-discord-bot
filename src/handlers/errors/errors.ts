export class DefaultError extends Error {
	public ephemeral: boolean;

	constructor(msg: string, ephemeral = true) {
		super(msg);
		this.ephemeral = ephemeral;
	}
}

export class UnreachableError extends DefaultError {
	constructor(msg: string) {
		super(msg);
		this.name = 'UnreachableError';
	}
}

export class UnauthorizedError extends DefaultError {
	constructor(msg: string, ephemeral: boolean) {
		super(msg, ephemeral);
		this.name = 'UnauthorizedError';
	}
}

export class CommandDoesntExistError extends DefaultError {
	constructor(msg: string) {
		super(msg);
		this.name = 'CommandDoesntExistError';
	}
}

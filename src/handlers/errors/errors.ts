export class DefaultError extends Error {
	public ephemeral: boolean;
	public reply: boolean;

	constructor(msg: string, ephemeral = true, reply = true) {
		super(msg);
		this.ephemeral = ephemeral;
		this.reply = reply;
	}
}

export class UnreachableError extends DefaultError {
	constructor(msg: string) {
		super(msg);
		this.name = 'UnreachableError';
	}
}

export class UnauthorizedError extends DefaultError {
	constructor(msg: string, ephemeral = true) {
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

export class InvalidInput extends DefaultError {
	constructor(msg: string) {
		super(msg);
		this.name = 'InvalidInput';
	}
}

export class NotFound extends DefaultError {
	constructor(msg: string) {
		super(msg);
		this.name = 'NotFound';
	}
}

class UserDTO {
    constructor(user) {
        this._id = user._id;
        this.name = user.name;
        this.username = user.username;
        this.email = user.email;
    }
}

export default UserDTO;
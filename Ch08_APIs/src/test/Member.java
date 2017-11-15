package test;

public class Member {
 //필드
	private String id;
	private String name;
	private String password;
	//생성자
	public Member(String id, String name, String password) {
		this.id = id;
		this.name = name;
		this.password = password;
	}
	//메소드
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getPassword() {
		return password;
	}
	public void setApssword(String password) {
		this.password = password;
	}
	//toString
	@Override
		public String toString() {
			return id+":"+name;
		}
	
	
	
}

package p01.test;
/**생성자와 객체를 만들고
 * 
 * */
public class Member {
	private String id;
	private String password;
	private String name;
	//생성자
	public Member(String id, String password, String name) {
		this.id = id;
		this.password = password;
		this.name = name;
	}
	
	//메소드
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	
	public void idCheck(String id) {
		
	}
	public void passwordCheck(String password) {
		
	}
	
}

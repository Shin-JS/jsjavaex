package p01.standard;
/**[API]
 *  객체를 복제하기위해서는 Cloneable인터페이스를 구현해서 만들어야 함
 **/
public class NewMember implements Cloneable{
	//필드
	public String id;
	public String name;
	public String password;
	public int age;
	public boolean adult;
	//생성자
	public NewMember(String id, String name, String password, int age, boolean adult) {
		this.id = id;
		this.name = name;
		this.password = password;
		this.age = age;
		this.adult = adult;
	}
	//메소드
	public NewMember getMember() {
		NewMember cloned = null;
		try {
			cloned = (NewMember)clone(); //clone메소드의 리턴값은 Object
		}catch(CloneNotSupportedException e) {
			System.out.println(e.getMessage());
		}
		return cloned;
	}//메소드 끝
	
}

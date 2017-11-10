package p01.standard;
/**[API]
 * 
 **/
public class Student {
	//필드
	String name;
	int sno;
	//생성자
	public Student(String name, int sno) {
		this.name = name;
		this.sno = sno;
	}
	@Override
	public boolean equals(Object obj) {
		if(obj instanceof Student) {
			Student student = (Student)obj;
			if(this.name.equals(student.name)&&this.sno==student.sno) {
				return true;
			}
		}
		return false;
	}
	
	@Override
	public int hashCode() {
		
		return name.hashCode()+sno;

	}
	
}

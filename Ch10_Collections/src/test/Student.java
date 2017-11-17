package test;

public class Student {
	//필드
	public int StudentNum;
	public String name;
	//생성자
	public Student(int studentNum, String name) {
		StudentNum = studentNum;
		this.name = name;
	}
	
	//hashCode()재정의
	@Override
	public int hashCode() {
		return StudentNum;
	} //해시코드가 같으면, equals에서 한번 더 확인 후 equals도 같아야 같은객체로 판단
	//equals()재정의
	@Override
	public boolean equals(Object obj) {
		if(obj instanceof Student){
			Student student = (Student)obj;
					return ((Student)obj).StudentNum==StudentNum;
		}else{
			return false;
		}
	}
}

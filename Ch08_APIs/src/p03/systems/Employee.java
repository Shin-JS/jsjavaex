package p03.systems;
/**[API]
 * 가비지 컬렉터
 **/
public class Employee {
	//필드
	public int eno;
	//생성자
	public Employee(int eno) {
		this.eno = eno;
		System.out.println(this.getClass().getSimpleName()+"("+eno+") 가 메모리에 생성됨");
	}
	
	//finalize()메소드 - 객체 소멸자
	//garbageCollector에 의해 객체가 소멸되기 직전에 호출되는 메소드
	@Override
	public void finalize() {
		System.out.println(this.getClass().getSimpleName()+"("+eno+")가 메모리에서 제거됨");
	}
}

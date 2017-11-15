package p03.systems;
/**[API]
 *  가비지 컬렉터
 **/
public class GcExample {
	public static void main(String[] args) {
		Employee emp; //객체 선언
		emp = new Employee(1); //객체 생성 및 초기화
		emp = null; //객체와의 연결이 끊어짐, Employee(1)은 쓰레기가 됨
		emp = new Employee(2);
		emp = new Employee(3); //employee(2)와의 연결이 끊어지고, employee(3)과 연결 → employee(2)는 쓰레기가 됨
		
		System.out.println("emp가 최종적으로 참조하는 사원번호: ");
		System.out.println(emp.eno);
		
		System.gc(); //쓰레기 수집기(garbageCollector)실행 요청
	}
}

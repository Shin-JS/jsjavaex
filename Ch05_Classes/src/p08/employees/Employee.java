package p08.employees;
/** [추상클래스를 활용한 예제]
 * -.급여계산용 프로그램
 * 
 **/
public abstract class Employee {
	//필드
	private final float RATE=0.1F; //상수
	private String name;
	int pay, bonus;
	//생성자
	public Employee(String name) {
		this.name = name;
	}
	//메소드
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	//메소드 - 급여계산
	public abstract int computePay(); //반드시 구현 필요
	//메소드에 final을 사용하면 자식클래스에서 수정불가
	public final int computeIncetive() {
		pay = computePay();
		if(pay>20000) {
			bonus = (int) (pay*RATE); //잔전처리
		} 
		return bonus;
	}
	public void print() {
		System.out.println(name + "의 급여: " + pay + ", 보너스: " + bonus);
	}
	
}

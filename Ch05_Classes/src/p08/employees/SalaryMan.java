package p08.employees;
/**[추상클래스를 활용한 예제]
 *  -.급여계산용 프로그램
 **/
public class SalaryMan extends Employee {
	// 필드
	private int annualSalary; // 초기값은 0

	public SalaryMan(String name) {
		super(name); //매개변수 1개짜리 부모생성자 호출
	}

	public SalaryMan(String name, int annualSalary) {
		this(name); //자신의 클래스내의 매개변수 1개짜리 생성자 호출
		//super(name);
		this.annualSalary = annualSalary;
	}
	
	public int getAnnualSalary() {
		return annualSalary;
	}

	public void setAnnualSalary(int annualSalary) {
		this.annualSalary = annualSalary;
	}

	@Override
	public int computePay() {
		return annualSalary/13; // int타입의 값을 리턴하므로 해당타입의 초기값으로 보여줌
	}
//	private int ComputeIncentive() {} //부모클래스에서 final로 선언된 메소드는 자식클래스에서 수정불가

}

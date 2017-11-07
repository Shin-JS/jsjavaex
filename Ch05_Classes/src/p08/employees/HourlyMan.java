package p08.employees;
/**[추상클래스를 활용한 예제]
 *  -.급여계산용 프로그램
 **/
public class HourlyMan extends Employee{
	//필드
	private int hour,perHour; //근무시간, 시급 필드, 초기값은 0
	public HourlyMan(String name) {
		super(name);
	}
	//Shift + Alt + S (단축키)
	public HourlyMan(String name, int hour, int perHour) {
		super(name);
		this.hour = hour;
		this.perHour = perHour;
	}
	
	@Override
	public int computePay() {
		return hour*perHour; //근무시간 * 시급
	}
	public int getHour() {
		return hour;
	}
	public void setHour(int hour) {
		this.hour = hour;
	}
	public int getPerHour() {
		return perHour;
	}
	public void setPerHour(int perHour) {
		this.perHour = perHour;
	}

	
}

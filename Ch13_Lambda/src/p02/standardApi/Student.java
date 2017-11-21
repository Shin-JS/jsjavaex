package p02.standardApi;

public class Student {
	//필드
	private String name;
	private int engScore;
	private int mathScore;
	//생성자
	public Student(String name, int engScore, int mathScore) {
		this.name = name;
		this.engScore = engScore;
		this.mathScore = mathScore;
	}
	//메소드
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getEngScore() {
		return engScore;
	}
	public void setEngScore(int engScore) {
		this.engScore = engScore;
	}
	public int getMathScore() {
		return mathScore;
	}
	public void setMathScore(int mathScore) {
		this.mathScore = mathScore;
	}
	
}

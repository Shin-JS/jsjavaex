package p02.standardApi;

public class Student2 {
	//필드
	private String name;
	private String gender;
	private int score;
	//생성자
	public Student2(String name, String gender, int score) {
		this.name = name;
		this.gender = gender;
		this.score = score;
	}
	//메소드
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getGender() {
		return gender;
	}
	public void setGender(String gender) {
		this.gender = gender;
	}
	public int getScore() {
		return score;
	}
	public void setScore(int score) {
		this.score = score;
	}
	
}

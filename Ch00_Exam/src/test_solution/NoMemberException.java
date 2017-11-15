package test_solution;

public class NoMemberException extends Exception {
	@Override
	public String getMessage() {
		return "id가 존재하지않습니다.";
	}
}

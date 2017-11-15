package test_solution;

public class NoMatchPaswordException extends Exception {
	@Override
	public String getMessage() {
		return "password가 다릅니다.";
	}
}
